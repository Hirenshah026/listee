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
  
  // Audio/Video States
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [seconds, setSeconds] = useState(0);
  const [lastCallDuration, setLastCallDuration] = useState<string | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const timerInterval = useRef<any>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    ringtoneRef.current = new Audio("tone/tone1.mp3");
    ringtoneRef.current.loop = true;
  }, []);

  // Callback refs to attach streams as soon as elements appear
  const setRemoteVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && remoteStream) node.srcObject = remoteStream;
  }, [remoteStream]);

  const setLocalVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && localStream) node.srcObject = localStream;
  }, [localStream, isVideoOff]);

  useImperativeHandle(ref, () => ({
    startCall: (type: 'voice' | 'video') => { handleStartCall(type); }
  }));

  useEffect(() => {
    if (isCalling) {
      ringtoneRef.current?.pause();
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
    socket.on("call-made", (data) => {
      setIncomingCall(data);
      ringtoneRef.current?.play().catch(() => {});
    });
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
    ringtoneRef.current?.pause();
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (peerConnection.current) peerConnection.current.close();
    setLocalStream(null);
    setRemoteStream(null);
    peerConnection.current = null;
    setIsCalling(false); setIncomingCall(null); setCallType(null);
  };

  const setupPeer = (stream: MediaStream, targetId: string) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));

    peerConnection.current.ontrack = (event) => {
      console.log("Got Remote Stream");
      setRemoteStream(event.streams[0]);
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
      setLocalStream(stream);
      setCallType(type);
      setIsCalling(true);
      setupPeer(stream, targetUser._id);
      const offer = await peerConnection.current!.createOffer();
      await peerConnection.current!.setLocalDescription(offer);
      socket.emit("call-user", { to: targetUser._id, offer, from: userId, type });
    } catch (err) { alert("Camera Error"); }
  };

  const acceptCall = async () => {
    setLastCallDuration(null);
    ringtoneRef.current?.pause();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: incomingCall.type === 'video', audio: true });
      setLocalStream(stream);
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
      {/* Hidden Audio for Voice Calls */}
      {isCalling && remoteStream && <audio ref={(el) => { if(el) el.srcObject = remoteStream }} autoPlay />}

      {/* Duration Summary */}
      {lastCallDuration && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-zinc-900 border border-white/20 p-4 rounded-2xl text-white flex items-center gap-4">
          <span>Call Duration: {lastCallDuration}</span>
          <button onClick={() => setLastCallDuration(null)}>✕</button>
        </div>
      )}

      {/* Incoming Call Screen */}
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[8888] bg-[#0b141a] flex flex-col items-center justify-around text-white">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-zinc-800 mx-auto mb-4 overflow-hidden">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="" />
            </div>
            <h2 className="text-2xl font-bold">{targetUser?.name}</h2>
            <p className="text-zinc-400">WhatsApp {incomingCall.type} call...</p>
          </div>
          <div className="flex gap-16">
            <button onClick={() => { socket.emit("end-call", { to: incomingCall.from }); stopAllTracks(); }} className="bg-red-500 w-16 h-16 rounded-full text-3xl shadow-xl">✕</button>
            <button onClick={acceptCall} className="bg-green-500 w-16 h-16 rounded-full text-3xl shadow-xl animate-bounce">✔</button>
          </div>
        </div>
      )}

      {/* Active Call UI */}
      {isCalling && (
        <div className="fixed inset-0 z-[8888] bg-[#0b141a] flex flex-col items-center justify-center overflow-hidden">
          {callType === 'video' ? (
            <video ref={setRemoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-black" />
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-4 border-[#1f2c34] mx-auto mb-6 overflow-hidden">
                <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="" />
              </div>
              <h2 className="text-white text-3xl font-semibold">{targetUser?.name}</h2>
              <p className="text-green-500 text-xl mt-2 font-mono">{formatTime(seconds)}</p>
            </div>
          )}

          {/* Self View Preview */}
          {callType === 'video' && !isVideoOff && (
            <div className="absolute top-8 right-6 w-28 h-40 rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl z-[8889]">
              <video ref={setLocalVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            </div>
          )}

          {/* Controls Bar */}
          <div className="absolute bottom-10 flex items-center justify-around w-[90%] max-w-[400px] bg-[#1f2c34]/95 backdrop-blur-md p-4 rounded-[40px] shadow-2xl">
            <button onClick={() => {
              const track = localStream?.getAudioTracks()[0];
              if(track) { track.enabled = !track.enabled; setIsMicMuted(!track.enabled); }
            }} className={`w-12 h-12 rounded-full flex items-center justify-center ${isMicMuted ? 'bg-white text-black' : 'bg-[#2a3942] text-white'}`}>
              {isMicMuted ? '🔇' : '🎤'}
            </button>

            {callType === 'video' && (
              <>
                <button onClick={() => {
                  const track = localStream?.getVideoTracks()[0];
                  if(track) { track.enabled = !track.enabled; setIsVideoOff(!track.enabled); }
                }} className={`w-12 h-12 rounded-full flex items-center justify-center ${isVideoOff ? 'bg-white text-black' : 'bg-[#2a3942] text-white'}`}>
                  {isVideoOff ? '🚫' : '📹'}
                </button>
                <button onClick={async () => {
                  const newMode = facingMode === 'user' ? 'environment' : 'user';
                  const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newMode }, audio: true });
                  const videoTrack = s.getVideoTracks()[0];
                  peerConnection.current?.getSenders().find(s => s.track?.kind === 'video')?.replaceTrack(videoTrack);
                  localStream?.getVideoTracks()[0].stop();
                  setLocalStream(s);
                  setFacingMode(newMode);
                }} className="w-12 h-12 rounded-full bg-[#2a3942] text-white">🔄</button>
              </>
            )}

            <button onClick={() => {
                const id = targetUser?._id || incomingCall?.from;
                socket.emit("end-call", { to: id });
                stopAllTracks();
              }} className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg">
              <span className="block rotate-[135deg] text-4xl">📞</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default CallOverlay;