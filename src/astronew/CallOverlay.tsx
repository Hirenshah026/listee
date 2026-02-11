import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import socket from "../components/chat/socket";

interface CallOverlayProps {
  userId: string | undefined;
  targetUser: any;
}

const CallOverlay = forwardRef((props: CallOverlayProps, ref) => {
  const { userId, targetUser } = props;
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useImperativeHandle(ref, () => ({
    startCall: (type: 'voice' | 'video') => { handleStartCall(type); }
  }));

  useEffect(() => {
    if (!userId) return;

    socket.on("call-made", (data) => setIncomingCall(data));

    socket.on("answer-made", async ({ answer }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) { console.error("Error setting remote description", e); }
      }
    });

    socket.on("ice-candidate", async (data) => {
      try {
        if (peerConnection.current && data.candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (e) { console.error("ICE Candidate error", e); }
    });

    socket.on("call-ended", () => stopAllTracks());

    return () => { 
      socket.off("call-made"); socket.off("answer-made"); 
      socket.off("ice-candidate"); socket.off("call-ended"); 
    };
  }, [userId]);

  const stopAllTracks = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setIsCalling(false); setIncomingCall(null); setCallType(null);
  };

  const setupPeer = (stream: MediaStream, targetId: string) => {
    // AB HUM TURN SERVERS USE KAR RAHE HAIN (Production Fix)
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        // Ye open-relay server hai, production mein Twilio ya Metered use karein
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        }
      ]
    });

    stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));

    peerConnection.current.ontrack = (event) => {
      console.log("Remote stream found!");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        // Chrome fix: force play
        remoteVideoRef.current.play().catch(e => console.error("Play error", e));
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: targetId, candidate: event.candidate });
      }
    };
  };

  const handleStartCall = async (type: 'voice' | 'video') => {
    if (!targetUser?._id) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: type === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 } } : false, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      setCallType(type);
      setIsCalling(true);
      setupPeer(stream, targetUser._id);

      const offer = await peerConnection.current!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video'
      });
      await peerConnection.current!.setLocalDescription(offer);

      socket.emit("call-user", { to: targetUser._id, offer, from: userId, type });

      setTimeout(() => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }, 500);
    } catch (err) { alert("Mic/Camera permissions issue!"); }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: incomingCall.type === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 } } : false, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      setCallType(incomingCall.type);
      setIsCalling(true);
      setupPeer(stream, incomingCall.from);

      await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await peerConnection.current!.createAnswer();
      await peerConnection.current!.setLocalDescription(answer);

      socket.emit("make-answer", { to: incomingCall.from, answer });
      setIncomingCall(null);

      setTimeout(() => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }, 500);
    } catch (err) { stopAllTracks(); }
  };

  return (
    <>
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[3000] bg-[#0b141a] flex flex-col items-center justify-around text-white p-6">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-zinc-700 rounded-full mb-4 border-4 border-yellow-500 overflow-hidden shadow-2xl">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user"/>
            </div>
            <h2 className="text-2xl font-bold">{targetUser?.name || "Astro User"}</h2>
            <p className="text-yellow-400 mt-2 animate-pulse uppercase tracking-widest text-xs font-bold font-mono">Incoming {incomingCall.type} call...</p>
          </div>
          <div className="flex gap-16">
            <button onClick={() => { socket.emit("end-call", { to: incomingCall.from }); setIncomingCall(null); }} className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg">✕</button>
            <button onClick={acceptCall} className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white shadow-lg animate-bounce">✔</button>
          </div>
        </div>
      )}

      {isCalling && (
        <div className="fixed inset-0 z-[3100] bg-black flex flex-col items-center justify-center">
          {callType === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-4 border-yellow-500 mb-6 overflow-hidden shadow-2xl">
                <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user" />
              </div>
              <h3 className="text-white text-2xl font-bold">{targetUser?.name}</h3>
              <p className="text-yellow-500 mt-2 font-mono tracking-widest text-xs uppercase animate-pulse">Call In Progress</p>
            </div>
          )}

          {callType === 'video' && (
            <div className="absolute top-6 right-6 w-28 h-40 border-2 border-white/20 rounded-2xl overflow-hidden bg-black shadow-2xl z-[3200]">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            </div>
          )}

          <div className="absolute bottom-16">
            <button 
              onClick={() => { socket.emit("end-call", { to: targetUser?._id || incomingCall?.from }); stopAllTracks(); }} 
              className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-90 border-4 border-white/10"
            >
              <span className="text-white text-4xl rotate-[135deg]">📞</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default CallOverlay;