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

  // Expose startCall to Parent (ChatPage)
  useImperativeHandle(ref, () => ({
    startCall: (type: 'voice' | 'video') => { handleStartCall(type); }
  }));

  useEffect(() => {
    if (!userId) return;

    // 1. Jab koi call kare (Incoming)
    socket.on("call-made", (data) => {
      console.log("Call received from:", data.from);
      setIncomingCall(data);
    });

    // 2. Jab dusra banda call utha le (Answer Received)
    socket.on("answer-made", async ({ answer }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) { console.error("Error setting answer:", e); }
      }
    });

    // 3. Network route dhoondne ke liye (ICE Candidates)
    socket.on("ice-candidate", async (data) => {
      try {
        if (peerConnection.current && data.candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (e) { console.error("ICE Error:", e); }
    });

    // 4. Call khatam hone par
    socket.on("call-ended", () => stopAllTracks());

    return () => { 
      socket.off("call-made"); 
      socket.off("answer-made"); 
      socket.off("ice-candidate"); 
      socket.off("call-ended"); 
    };
  }, [userId]);

  const stopAllTracks = () => {
    // Mic aur Camera off karo
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    // Peer connection khatam karo
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setIsCalling(false);
    setIncomingCall(null);
    setCallType(null);
  };

  const setupPeer = (stream: MediaStream, targetId: string) => {
    // STUN Servers connection banane mein madad karte hain
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });

    // Local video/audio tracks add karo
    stream.getTracks().forEach(track => {
      peerConnection.current?.addTrack(track, stream);
    });

    // Jab samne wale ki video stream mil jaye
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Apne network candidates server ko bhejo
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
        video: type === 'video' ? { facingMode: "user" } : false, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      setCallType(type);
      setIsCalling(true);
      
      setupPeer(stream, targetUser._id);

      const offer = await peerConnection.current!.createOffer();
      await peerConnection.current!.setLocalDescription(offer);

      socket.emit("call-user", { to: targetUser._id, offer, from: userId, type });

      // Local preview dikhao
      setTimeout(() => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }, 500);
    } catch (err) { 
      alert("Mic/Camera Access Denied! Please check permissions."); 
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: incomingCall.type === 'video', 
        audio: true 
      });
      
      localStreamRef.current = stream;
      setCallType(incomingCall.type);
      setIsCalling(true);
      
      setupPeer(stream, incomingCall.from);

      // Signaling Flow: Set Remote -> Create Answer -> Set Local
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
      {/* 1. Incoming Call Screen */}
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[3000] bg-[#0b141a] flex flex-col items-center justify-around text-white p-6 animate-in fade-in">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-zinc-700 rounded-full mb-4 border-4 border-green-500 overflow-hidden shadow-2xl">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user"/>
            </div>
            <h2 className="text-2xl font-bold">{targetUser?.name || "Astro User"}</h2>
            <p className="text-green-400 mt-2 animate-pulse uppercase tracking-widest text-xs font-bold">
               Incoming {incomingCall.type} call...
            </p>
          </div>
          <div className="flex gap-16">
            <button 
                onClick={() => { socket.emit("end-call", { to: incomingCall.from }); setIncomingCall(null); }} 
                className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg active:scale-90"
            >✕</button>
            <button 
                onClick={acceptCall} 
                className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white shadow-lg animate-bounce active:scale-90"
            >✔</button>
          </div>
        </div>
      )}

      {/* 2. Active Call UI */}
      {isCalling && (
        <div className="fixed inset-0 z-[3100] bg-black flex flex-col items-center justify-center overflow-hidden">
          
          {/* Main Display Area (Remote Video) */}
          {callType === 'video' ? (
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-4 border-green-500 mb-6 overflow-hidden shadow-2xl">
                <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user" />
              </div>
              <h3 className="text-white text-2xl font-bold">{targetUser?.name}</h3>
              <p className="text-green-500 mt-2 font-mono tracking-widest text-xs uppercase animate-pulse">Connected</p>
            </div>
          )}

          {/* Self Preview Floating Window */}
          {callType === 'video' && (
            <div className="absolute top-6 right-6 w-28 h-40 border-2 border-white/20 rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl z-[3200]">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]" 
              />
            </div>
          )}

          {/* End Call Button */}
          <div className="absolute bottom-16">
            <button 
              onClick={() => { 
                const targetId = targetUser?._id || incomingCall?.from;
                socket.emit("end-call", { to: targetId }); 
                stopAllTracks(); 
              }} 
              className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-95 border-4 border-white/10"
            >
              <span className="text-white text-3xl rotate-[135deg]">📞</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default CallOverlay;