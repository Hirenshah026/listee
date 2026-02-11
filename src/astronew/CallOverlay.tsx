import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react";
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
  
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [seconds, setSeconds] = useState(0);
  const [lastCallDuration, setLastCallDuration] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const timerInterval = useRef<any>(null);

  // 🔥 MAGIC FIX: Callback Ref jo element aate hi stream attach karega
  const setRemoteVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && remoteStreamRef.current) {
      node.srcObject = remoteStreamRef.current;
    }
  }, [isCalling]);

  const setLocalVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && localStreamRef.current) {
      node.srcObject = localStreamRef.current;
    }
  }, [isCalling, isVideoOff]);

  useImperativeHandle(ref, () => ({
    startCall: (type: 'voice' | 'video') => { handleStartCall(type); }
  }));

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
    socket.on("call-ended", () => stopAllTracks());
    return () => {
      socket.off("call-made"); socket.off("answer-made");
      socket.off("ice-candidate"); socket.off("call-ended");
    };
  }, [userId]);

  const stopAllTracks = () => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (peerConnection.current) peerConnection.current.close();
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    peerConnection.current = null;
    setIsCalling(false); setIncomingCall(null); setCallType(null);
  };

  const setupPeer = (stream: MediaStream, targetId: string) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));

    peerConnection.current.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      // Force state update to trigger callback ref
      setIsCalling(true); 
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
    } catch (err) { alert("Mic/Camera Error"); }
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
    } catch (err) { stopAllTracks(); }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Duration Popup */}
      {lastCallDuration && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-zinc-900 border border-white/20 p-4 rounded-2xl text-white flex gap-4">
          <span>Call Duration: {lastCallDuration}</span>
          <button onClick={() => setLastCallDuration(null)}>✕</button>
        </div>
      )}

      {/* Incoming */}
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[8888] bg-[#0b141a] flex flex-col items-center justify-around text-white">
          <div className="text-center">
             <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-24 h-24 rounded-full mx-auto border-2 border-zinc-700" alt="" />
             <h2 className="text-2xl mt-4">{targetUser?.name}</h2>
          </div>
          <div className="flex gap-20">
            <button onClick={() => { socket.emit("end-call", { to: incomingCall.from }); setIncomingCall(null); }} className="bg-red-500 p-5 rounded-full">✕</button>
            <button onClick={acceptCall} className="bg-green-500 p-5 rounded-full animate-bounce">✔</button>
          </div>
        </div>
      )}

      {/* Active Call */}
      {isCalling && (
        <div className="fixed inset-0 z-[8888] bg-[#0b141a] flex flex-col items-center justify-center overflow-hidden">
          {callType === 'video' ? (
            <video ref={setRemoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-32 h-32 rounded-full mx-auto border-4 border-[#1f2c34]" alt="" />
              <h2 className="text-white text-2xl mt-4">{targetUser?.name}</h2>
              <p className="text-zinc-400">{formatTime(seconds)}</p>
            </div>
          )}

          {/* Mini Self Preview */}
          {callType === 'video' && (
            <div className="absolute top-6 right-6 w-24 h-36 rounded-xl overflow-hidden bg-black border border-white/20">
              <video ref={setLocalVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            </div>
          )}

          {/* Control Bar */}
          <div className="absolute bottom-10 flex items-center justify-between w-[85%] max-w-[380px] bg-[#1f2c34]/95 p-4 rounded-[30px] shadow-2xl">
            <button onClick={() => {
              const track = localStreamRef.current?.getAudioTracks()[0];
              if(track) { track.enabled = !track.enabled; setIsMicMuted(!track.enabled); }
            }} className={`p-3 rounded-full ${isMicMuted ? 'bg-white text-black' : 'text-white bg-zinc-700'}`}>
              {isMicMuted ? '🔇' : '🎤'}
            </button>

            {callType === 'video' && (
              <button onClick={async () => {
                const newMode = facingMode === 'user' ? 'environment' : 'user';
                const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newMode }, audio: true });
                const videoTrack = s.getVideoTracks()[0];
                peerConnection.current?.getSenders().find(s => s.track?.kind === 'video')?.replaceTrack(videoTrack);
                localStreamRef.current?.getVideoTracks()[0].stop();
                localStreamRef.current = s;
                setFacingMode(newMode);
              }} className="p-3 rounded-full bg-zinc-700 text-white">🔄</button>
            )}

            <button onClick={() => {
                const id = targetUser?._id || incomingCall?.from;
                socket.emit("end-call", { to: id });
                stopAllTracks();
              }} className="bg-red-500 p-4 rounded-full text-white">
              <span className="block rotate-[135deg] text-2xl">📞</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default CallOverlay;