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

  // FIXED: Local Video ko stream attach karne ka automatic tarika
  useEffect(() => {
    if (isCalling && localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [isCalling, isVideoOff]);

  useEffect(() => {
    if (isCalling) {
      timerInterval.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
      setSeconds(0);
    }
    return () => { if (timerInterval.current) clearInterval(timerInterval.current); };
  }, [isCalling]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

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
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" }]
    });

    stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: targetId, candidate: event.candidate });
      }
    };
  };

  const handleStartCall = async (type: 'voice' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video' ? { facingMode: 'user' } : false,
        audio: true
      });
      localStreamRef.current = stream;
      setCallType(type);
      setIsCalling(true);
      setupPeer(stream, targetUser._id);
      const offer = await peerConnection.current!.createOffer();
      await peerConnection.current!.setLocalDescription(offer);
      socket.emit("call-user", { to: targetUser._id, offer, from: userId, type });
    } catch (err) { alert("Camera/Mic access denied!"); }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.type === 'video' ? { facingMode: 'user' } : false,
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
    } catch (err) { stopAllTracks(); }
  };

  return (
    <>
      {/* Incoming Call Screen */}
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[5000] bg-[#0b141a] flex flex-col items-center justify-between py-20 text-white">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-zinc-800 mx-auto mb-4 overflow-hidden ring-4 ring-zinc-700">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user" />
            </div>
            <h2 className="text-2xl font-semibold">{targetUser?.name || "User"}</h2>
            <p className="text-zinc-400 mt-2">WhatsApp {incomingCall.type} call</p>
          </div>
          <div className="flex w-full justify-around px-10">
            <button onClick={() => { socket.emit("end-call", { to: incomingCall.from }); setIncomingCall(null); }} className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center text-2xl">✕</button>
            <button onClick={acceptCall} className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center text-2xl animate-bounce">✔</button>
          </div>
        </div>
      )}

      {/* Active Call Screen */}
      {isCalling && (
        <div className="fixed inset-0 z-[5000] bg-[#0b141a] flex flex-col items-center justify-center text-white overflow-hidden">
          {callType === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-2 border-zinc-700 mx-auto mb-6 overflow-hidden">
                <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="user" />
              </div>
              <h3 className="text-2xl font-medium">{targetUser?.name}</h3>
              <p className="text-zinc-400 mt-2">{formatTime(seconds)}</p>
            </div>
          )}

          {/* Floating Self Preview */}
          {callType === 'video' && !isVideoOff && (
            <div className="absolute top-6 right-6 w-24 h-36 rounded-xl overflow-hidden bg-black border border-white/20 z-[5100]">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            </div>
          )}

          {/* WhatsApp Control Bar */}
          <div className="absolute bottom-10 flex items-center justify-between w-[90%] max-w-[400px] bg-[#1f2c34]/90 backdrop-blur-xl px-6 py-4 rounded-[32px] border border-white/5 shadow-2xl">
            <button onClick={() => {
              if (localStreamRef.current) {
                const track = localStreamRef.current.getAudioTracks()[0];
                track.enabled = !track.enabled;
                setIsMicMuted(!track.enabled);
              }
            }} className={`w-12 h-12 rounded-full flex items-center justify-center ${isMicMuted ? 'bg-white text-black' : 'bg-[#2a3942]'}`}>
              {isMicMuted ? '🔇' : '🎤'}
            </button>

            {callType === 'video' && (
              <>
                <button onClick={() => {
                  if (localStreamRef.current) {
                    const track = localStreamRef.current.getVideoTracks()[0];
                    track.enabled = !track.enabled;
                    setIsVideoOff(!track.enabled);
                  }
                }} className={`w-12 h-12 rounded-full flex items-center justify-center ${isVideoOff ? 'bg-white text-black' : 'bg-[#2a3942]'}`}>
                  {isVideoOff ? '🚫' : '📹'}
                </button>
                <button onClick={async () => {
                   const newMode = facingMode === 'user' ? 'environment' : 'user';
                   const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newMode }, audio: true });
                   const videoTrack = newStream.getVideoTracks()[0];
                   const sender = peerConnection.current?.getSenders().find(s => s.track?.kind === 'video');
                   sender?.replaceTrack(videoTrack);
                   setFacingMode(newMode);
                   localStreamRef.current = newStream;
                }} className="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center">🔄</button>
              </>
            )}

            <button onClick={() => { 
                const tid = targetUser?._id || incomingCall?.from;
                socket.emit("end-call", { to: tid }); 
                stopAllTracks(); 
              }} className="bg-[#ea0038] w-14 h-14 rounded-full flex items-center justify-center">
              <span className="text-3xl rotate-[135deg]">📞</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default CallOverlay;