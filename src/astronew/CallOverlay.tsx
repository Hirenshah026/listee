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
  
  // Controls & Timer States
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [seconds, setSeconds] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // FIXED: Using 'any' to avoid NodeJS namespace error in Browser
  const timerInterval = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    startCall: (type: 'voice' | 'video') => { handleStartCall(type); }
  }));

  // Timer Logic
  useEffect(() => {
    if (isCalling) {
      timerInterval.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      setSeconds(0);
    }
    return () => { if (timerInterval.current) clearInterval(timerInterval.current); };
  }, [isCalling]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!userId) return;

    socket.on("call-made", (data) => setIncomingCall(data));

    socket.on("answer-made", async ({ answer }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) { console.error("Remote Description Error", e); }
      }
    });

    socket.on("ice-candidate", async (data) => {
      try {
        if (peerConnection.current && data.candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (e) { console.error("ICE Error", e); }
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
    setIsCalling(false);
    setIncomingCall(null);
    setCallType(null);
    setIsMicMuted(false);
    setIsVideoOff(false);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && callType === 'video') {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const switchCamera = async () => {
    if (callType !== 'video' || !localStreamRef.current) return;
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode },
        audio: true
      });
      const videoTrack = newStream.getVideoTracks()[0];
      const sender = peerConnection.current?.getSenders().find(s => s.track?.kind === 'video');
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
        // Old track stop karo battery bachane ke liye
        localStreamRef.current.getVideoTracks()[0].stop();
        localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0]);
        localStreamRef.current.addTrack(videoTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setFacingMode(newMode);
      }
    } catch (err) { console.error("Camera Switch Error", err); }
  };

  const setupPeer = (stream: MediaStream, targetId: string) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
        { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" }
      ]
    });

    stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(() => {});
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
        video: type === 'video' ? { facingMode: 'user' } : false,
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      localStreamRef.current = stream;
      setCallType(type);
      setIsCalling(true);
      setupPeer(stream, targetUser._id);
      const offer = await peerConnection.current!.createOffer();
      await peerConnection.current!.setLocalDescription(offer);
      socket.emit("call-user", { to: targetUser._id, offer, from: userId, type });
      setTimeout(() => { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }, 500);
    } catch (err) { alert("Mic/Camera error! Please allow permissions."); }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.type === 'video' ? { facingMode: 'user' } : false,
        audio: { echoCancellation: true, noiseSuppression: true }
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
      setTimeout(() => { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }, 500);
    } catch (err) { stopAllTracks(); }
  };

  return (
    <>
      {/* 1. Incoming Call UI */}
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[3000] bg-[#0b141a] flex flex-col items-center justify-around text-white p-6">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full border-4 border-orange-500 overflow-hidden shadow-2xl">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user" />
            </div>
            <h2 className="text-2xl font-bold mt-4">{targetUser?.name || "Astro"}</h2>
            <p className="text-orange-400 animate-pulse mt-2 uppercase text-xs font-bold font-mono">Incoming {incomingCall.type} call...</p>
          </div>
          <div className="flex gap-16">
            <button onClick={() => { socket.emit("end-call", { to: incomingCall.from }); setIncomingCall(null); }} className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg active:scale-90">✕</button>
            <button onClick={acceptCall} className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white shadow-lg animate-bounce active:scale-90">✔</button>
          </div>
        </div>
      )}

      {/* 2. Active Call UI */}
      {isCalling && (
        <div className="fixed inset-0 z-[3100] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
          
          {/* Remote Media Display */}
          {callType === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-black" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-4 border-orange-500 mb-4 overflow-hidden shadow-2xl">
                <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user" />
              </div>
              <h3 className="text-white text-2xl font-bold">{targetUser?.name}</h3>
            </div>
          )}

          {/* Timer Overlay */}
          <div className="absolute top-10 text-white font-mono bg-black/60 px-6 py-2 rounded-full text-lg z-[3300] border border-white/10 backdrop-blur-sm">
            {formatTime(seconds)}
          </div>

          {/* Floating Local Preview */}
          {callType === 'video' && !isVideoOff && (
            <div className="absolute top-24 right-6 w-28 h-40 border-2 border-white/20 rounded-2xl overflow-hidden bg-black shadow-2xl z-[3200]">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            </div>
          )}

          {/* Controls Bar */}
          <div className="absolute bottom-10 flex items-center gap-4 bg-zinc-900/90 p-5 rounded-[40px] backdrop-blur-xl border border-white/10 shadow-2xl">
            {/* Mic Toggle */}
            <button onClick={toggleMic} className={`${isMicMuted ? 'bg-red-500' : 'bg-zinc-700 hover:bg-zinc-600'} w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg`}>
              {isMicMuted ? '🔇' : '🎤'}
            </button>

            {/* Video Features */}
            {callType === 'video' && (
              <>
                <button onClick={toggleVideo} className={`${isVideoOff ? 'bg-red-500' : 'bg-zinc-700 hover:bg-zinc-600'} w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg`}>
                  {isVideoOff ? '🚫' : '📹'}
                </button>
                <button onClick={switchCamera} className="bg-zinc-700 hover:bg-zinc-600 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg">
                  🔄
                </button>
              </>
            )}

            {/* End Call */}
            <button 
              onClick={() => { 
                const targetId = targetUser?._id || incomingCall?.from;
                socket.emit("end-call", { to: targetId }); 
                stopAllTracks(); 
              }} 
              className="bg-red-600 hover:bg-red-700 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-90 ml-2 transition-all"
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