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
  
  // Controls & Timer
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [seconds, setSeconds] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerInterval = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    startCall: (type: 'voice' | 'video') => { handleStartCall(type); }
  }));

  // Timer logic
  useEffect(() => {
    if (isCalling) {
      timerInterval.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
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
        } catch (e) { console.error(e); }
      }
    });

    socket.on("ice-candidate", async (data) => {
      try {
        if (peerConnection.current && data.candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (e) { console.error(e); }
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
    setIsMicMuted(false); setIsVideoOff(false);
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
        localStreamRef.current.getVideoTracks()[0].stop();
        localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0]);
        localStreamRef.current.addTrack(videoTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setFacingMode(newMode);
      }
    } catch (err) { console.error(err); }
  };

  const setupPeer = (stream: MediaStream, targetId: string) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" }
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
    } catch (err) { alert("Mic/Camera error!"); }
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
      {/* 1. WhatsApp Style Incoming Call Screen */}
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[3000] bg-[#0b141a] flex flex-col items-center justify-between py-20 text-white">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-zinc-800 mb-4 overflow-hidden ring-4 ring-zinc-700">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user" />
            </div>
            <h2 className="text-2xl font-semibold">{targetUser?.name || "Astro User"}</h2>
            <p className="text-zinc-400 text-sm mt-1">WhatsApp {incomingCall.type} call</p>
          </div>
          
          <div className="flex w-full justify-around px-10">
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => { socket.emit("end-call", { to: incomingCall.from }); setIncomingCall(null); }} className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl">✕</button>
              <span className="text-xs text-zinc-400">Decline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={acceptCall} className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white shadow-xl animate-bounce">✔</button>
              <span className="text-xs text-zinc-400">Accept</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. WhatsApp Style Active Call Overlay */}
      {isCalling && (
        <div className="fixed inset-0 z-[3100] bg-[#0b141a] flex flex-col items-center justify-center overflow-hidden">
          
          {/* Main Display: Remote View */}
          {callType === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
               <div className="w-32 h-32 rounded-full border-2 border-zinc-700 mb-6 overflow-hidden">
                <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user" />
              </div>
              <h3 className="text-white text-2xl font-medium">{targetUser?.name}</h3>
              <p className="text-zinc-400 text-sm mt-2">{formatTime(seconds)}</p>
            </div>
          )}

          {/* Video Specific Overlays */}
          {callType === 'video' && (
            <>
              {/* Header: Name and Timer */}
              <div className="absolute top-10 left-6 text-white z-[3300]">
                <h3 className="text-lg font-medium drop-shadow-md">{targetUser?.name}</h3>
                <p className="text-sm opacity-80 drop-shadow-md">{formatTime(seconds)}</p>
              </div>

              {/* Floating Mini Window (Self View) */}
              {!isVideoOff && (
                <div className="absolute top-6 right-6 w-24 h-36 rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl z-[3200]">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                </div>
              )}
            </>
          )}

          {/* WhatsApp Style Bottom Control Bar */}
          <div className="absolute bottom-10 flex items-center justify-between w-[90%] max-w-[400px] bg-[#1f2c34]/90 backdrop-blur-xl px-6 py-4 rounded-[32px] border border-white/5 shadow-2xl z-[3400]">
            
            {/* Mic Toggle */}
            <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicMuted ? 'bg-white text-black' : 'bg-[#2a3942] text-white'}`}>
              <span className="text-xl">{isMicMuted ? '🔇' : '🎤'}</span>
            </button>

            {/* Video Features */}
            {callType === 'video' && (
              <>
                <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-white text-black' : 'bg-[#2a3942] text-white'}`}>
                  <span className="text-xl">{isVideoOff ? '🚫' : '📹'}</span>
                </button>
                <button onClick={switchCamera} className="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center text-white active:bg-zinc-600">
                  <span className="text-xl">🔄</span>
                </button>
              </>
            )}

            {/* End Call Button */}
            <button 
              onClick={() => { socket.emit("end-call", { to: targetUser?._id || incomingCall?.from }); stopAllTracks(); }} 
              className="bg-[#ea0038] w-14 h-14 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
            >
              <span className="text-3xl rotate-[135deg]">📞</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default CallOverlay;