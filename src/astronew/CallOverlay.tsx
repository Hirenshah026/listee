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
  const [isDummy, setIsDummy] = useState(false); 

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Expose startCall to parent (ChatPage)
  useImperativeHandle(ref, () => ({
    startCall: (type: 'voice' | 'video') => { handleStartCall(type); }
  }));

  useEffect(() => {
    if (!userId) return;

    socket.on("call-made", (data) => {
      console.log("Incoming call from:", data.from);
      setIncomingCall(data);
    });

    socket.on("answer-made", async ({ answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    });

    socket.on("call-ended", () => {
      stopAllTracks();
    });

    return () => { 
      socket.off("call-made"); 
      socket.off("answer-made"); 
      socket.off("ice-candidate"); 
      socket.off("call-ended"); 
    };
  }, [userId]);

  const stopAllTracks = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setIsCalling(false);
    setIncomingCall(null);
    setCallType(null);
    setIsDummy(false);
  };

  const setupPeer = (stream: MediaStream, targetId: string) => {
    // Basic STUN server (Production mein TURN server zaroori hota hai for 4G/Firewalls)
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });

    // Add local tracks to peer connection
    stream.getTracks().forEach(track => {
      peerConnection.current?.addTrack(track, stream);
    });

    // Handle incoming remote stream
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: targetId, candidate: event.candidate });
      }
    };
  };

  const handleStartCall = async (type: 'voice' | 'video') => {
    if (!targetUser?._id) return;

    try {
      const constraints = { video: type === 'video', audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      localStreamRef.current = stream;
      setCallType(type);
      setIsCalling(true);

      setupPeer(stream, targetUser._id);

      const offer = await peerConnection.current!.createOffer();
      await peerConnection.current!.setLocalDescription(offer);

      socket.emit("call-user", { 
        to: targetUser._id, 
        offer, 
        from: userId, 
        type,
        isDummy: false 
      });

      // Set local video preview
      setTimeout(() => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }, 500);

    } catch (err) {
      console.error("Call Permission Denied or Error:", err);
      // Fallback for dummy call UI if media fails
      setCallType(type);
      setIsCalling(true);
      setIsDummy(true);
      socket.emit("call-user", { to: targetUser._id, offer: null, from: userId, type, isDummy: true });
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      if (incomingCall.isDummy) {
        setCallType(incomingCall.type);
        setIsCalling(true);
        setIncomingCall(null);
        setIsDummy(true);
        return;
      }

      const constraints = { video: incomingCall.type === 'video', audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
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

    } catch (err) {
      console.error("Error accepting call:", err);
      setCallType(incomingCall.type);
      setIsCalling(true);
      setIncomingCall(null);
      setIsDummy(true);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit("end-call", { to: incomingCall.from });
      setIncomingCall(null);
    }
  };

  const endActiveCall = () => {
    const remoteId = targetUser?._id || incomingCall?.from;
    socket.emit("end-call", { to: remoteId });
    stopAllTracks();
  };

  return (
    <>
      {/* Incoming Call UI */}
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[3000] bg-[#0b141a] flex flex-col items-center justify-around text-white p-6 animate-in fade-in duration-300">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-zinc-700 rounded-full mb-4 border-4 border-orange-500 overflow-hidden shadow-2xl">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user"/>
            </div>
            <h2 className="text-2xl font-bold">{targetUser?.name || "Astro Guest"}</h2>
            <p className="text-orange-400 mt-2 animate-pulse uppercase tracking-widest text-xs font-bold">
              Incoming {incomingCall.type} call...
            </p>
          </div>
          <div className="flex gap-16">
            <button onClick={rejectCall} className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg active:scale-90 transition-transform">✕</button>
            <button onClick={acceptCall} className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white shadow-lg animate-bounce active:scale-90 transition-transform">✔</button>
          </div>
        </div>
      )}

      {/* Active Call UI */}
      {isCalling && (
        <div className="fixed inset-0 z-[3100] bg-[#0b141a] flex flex-col items-center justify-center overflow-hidden">
          
          {/* Remote Video or Profile Pic */}
          {!isDummy && callType === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-4 border-orange-500 mb-6 overflow-hidden shadow-2xl animate-pulse">
                <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user" />
              </div>
              <h3 className="text-white text-2xl font-bold">{targetUser?.name}</h3>
              <p className="text-orange-500 mt-2 font-mono tracking-widest text-xs">
                {isDummy ? "MEDIA NOT ACCESSIBLE" : (callType === 'video' ? "CONNECTING VIDEO..." : "VOICE CALL IN PROGRESS")}
              </p>
            </div>
          )}

          {/* Local Preview (Small Window) */}
          {callType === 'video' && (
            <div className="absolute top-6 right-6 w-28 h-40 border-2 border-white/20 rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl z-[3200]">
              {!isDummy ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] font-bold uppercase">No Preview</div>
              )}
            </div>
          )}

          {/* End Call Button */}
          <div className="absolute bottom-16">
            <button 
              onClick={endActiveCall} 
              className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 border-white/10 group"
            >
              <span className="text-white text-3xl rotate-[135deg] group-hover:scale-110 transition-transform">📞</span>
            </button>
            <p className="text-white/50 text-center mt-4 text-[10px] font-bold tracking-widest uppercase">End Call</p>
          </div>
        </div>
      )}
    </>
  );
});

export default CallOverlay;