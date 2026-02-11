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
  
  // States
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [seconds, setSeconds] = useState(0);
  const [lastCallDuration, setLastCallDuration] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerInterval = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    startCall: (type: 'voice' | 'video') => { handleStartCall(type); }
  }));

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isCalling) {
      timerInterval.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (seconds > 0) setLastCallDuration(formatTime(seconds));
      clearInterval(timerInterval.current);
      setSeconds(0);
    }
    return () => clearInterval(timerInterval.current);
  }, [isCalling]);

  useEffect(() => {
    if (!userId) return;

    socket.on("call-made", (data) => setIncomingCall(data));

    socket.on("answer-made", async ({ answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", async (data) => {
      if (peerConnection.current && data.candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // Jab samne wala call kate (End Call Sync)
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
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));

    peerConnection.current.ontrack = (event) => {
      setTimeout(() => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      }, 200);
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: targetId, candidate: event.candidate });
      }
    };
  };

  const handleStartCall = async (type: 'voice' | 'video') => {
    setLastCallDuration(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
      localStreamRef.current = stream;
      setCallType(type);
      setIsCalling(true);
      setupPeer(stream, targetUser._id);

      const offer = await peerConnection.current!.createOffer();
      await peerConnection.current!.setLocalDescription(offer);
      socket.emit("call-user", { to: targetUser._id, offer, from: userId, type });

      setTimeout(() => { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }, 500);
    } catch (err) { alert("Permissions error!"); }
  };

  const acceptCall = async () => {
    setLastCallDuration(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: incomingCall.type === 'video', audio: true });
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

  const switchCamera = async () => {
    if (callType !== 'video' || !localStreamRef.current) return;
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newMode }, audio: true });
      const videoTrack = newStream.getVideoTracks()[0];
      const sender = peerConnection.current?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(videoTrack);
        localStreamRef.current.getVideoTracks()[0].stop();
        localStreamRef.current = newStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
        setFacingMode(newMode);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <>
      {/* 1. Call Summary Popup (Last Duration) */}
      {lastCallDuration && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top">
          <div className="text-white">
            <p className="text-xs text-zinc-400">Call Ended</p>
            <p className="font-bold">Duration: {lastCallDuration}</p>
          </div>
          <button onClick={() => setLastCallDuration(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white">✕</button>
        </div>
      )}

      {/* 2. Incoming Call */}
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[999] bg-[#0b141a] flex flex-col items-center justify-around text-white">
          <div className="text-center">
            <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-24 h-24 rounded-full mx-auto border-2 border-zinc-700" alt="" />
            <h2 className="text-2xl mt-4 font-bold">{targetUser?.name}</h2>
            <p className="text-zinc-400">Incoming {incomingCall.type} call</p>
          </div>
          <div className="flex gap-20">
            <button onClick={() => { socket.emit("end-call", { to: incomingCall.from }); setIncomingCall(null); }} className="bg-red-500 p-5 rounded-full text-2xl">✕</button>
            <button onClick={acceptCall} className="bg-green-500 p-5 rounded-full text-2xl animate-bounce">✔</button>
          </div>
        </div>
      )}

      {/* 3. Active Call UI */}
      {isCalling && (
        <div className="fixed inset-0 z-[999] bg-[#0b141a] flex flex-col items-center justify-center overflow-hidden">
          {callType === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-32 h-32 rounded-full mx-auto border-4 border-[#1f2c34]" alt="" />
              <h2 className="text-white text-2xl mt-4">{targetUser?.name}</h2>
              <p className="text-zinc-400 font-mono text-xl">{formatTime(seconds)}</p>
            </div>
          )}

          {callType === 'video' && (
            <div className="absolute top-6 right-6 w-24 h-36 rounded-xl overflow-hidden bg-black border border-white/20 shadow-2xl">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            </div>
          )}

          {/* Control Bar */}
          <div className="absolute bottom-10 flex items-center justify-between w-[90%] max-w-[380px] bg-[#1f2c34]/95 p-4 rounded-[30px] shadow-2xl backdrop-blur-md">
            <button onClick={() => {
              const track = localStreamRef.current?.getAudioTracks()[0];
              if(track) { track.enabled = !track.enabled; setIsMicMuted(!track.enabled); }
            }} className={`p-3 w-12 h-12 rounded-full ${isMicMuted ? 'bg-white text-black' : 'bg-zinc-700 text-white'}`}>{isMicMuted ? '🔇' : '🎤'}</button>

            {callType === 'video' && (
              <>
                <button onClick={() => {
                  const track = localStreamRef.current?.getVideoTracks()[0];
                  if(track) { track.enabled = !track.enabled; setIsVideoOff(!track.enabled); }
                }} className={`p-3 w-12 h-12 rounded-full ${isVideoOff ? 'bg-white text-black' : 'bg-zinc-700 text-white'}`}>{isVideoOff ? '🚫' : '📹'}</button>
                
                <button onClick={switchCamera} className="bg-zinc-700 p-3 w-12 h-12 rounded-full text-white">🔄</button>
              </>
            )}

            <button onClick={() => {
                const id = targetUser?._id || incomingCall?.from;
                socket.emit("end-call", { to: id });
                stopAllTracks();
              }} className="bg-red-500 w-14 h-14 rounded-full text-white shadow-lg">
              <span className="block rotate-[135deg] text-3xl">📞</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default CallOverlay;