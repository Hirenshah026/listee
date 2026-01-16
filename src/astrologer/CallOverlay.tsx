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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useImperativeHandle(ref, () => ({
    startCall: (type: 'voice' | 'video') => { startCall(type); }
  }));

  useEffect(() => {
    if (!userId) return;
    socket.on("call-made", (data) => setIncomingCall(data));
    socket.on("answer-made", async ({ answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      try { if (peerConnection.current) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
    });
    socket.on("call-ended", () => stopAllTracks());
    return () => { socket.off("call-made"); socket.off("answer-made"); socket.off("ice-candidate"); socket.off("call-ended"); };
  }, [userId, localStream]);

  const stopAllTracks = () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (peerConnection.current) { peerConnection.current.close(); peerConnection.current = null; }
    setIsCalling(false); setIncomingCall(null); setLocalStream(null); setCallType(null); setIsDummy(false);
  };

  const setupPeer = (stream: MediaStream, targetId: string) => {
    peerConnection.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));
    peerConnection.current.onicecandidate = (e) => { if (e.candidate) socket.emit("ice-candidate", { to: targetId, candidate: e.candidate }); };
    peerConnection.current.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
  };

  const startCall = async (type: 'voice' | 'video') => {
    if (!targetUser) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
      setCallType(type); setIsCalling(true); setLocalStream(stream);
      setupPeer(stream, targetUser._id);
      const offer = await peerConnection.current!.createOffer();
      await peerConnection.current!.setLocalDescription(offer);
      socket.emit("call-user", { to: targetUser._id, offer, from: userId, type });
      setTimeout(() => { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }, 500);
    } catch (err) {
      setCallType(type); setIsCalling(true); setIsDummy(true);
      socket.emit("call-user", { to: targetUser._id, offer: null, from: userId, type, isDummy: true });
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      if (incomingCall.isDummy) {
        setCallType(incomingCall.type); setIsCalling(true); setIncomingCall(null); setIsDummy(true);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: incomingCall.type === 'video', audio: true });
      setCallType(incomingCall.type); setIsCalling(true); setIncomingCall(null); setLocalStream(stream);
      setupPeer(stream, incomingCall.from);
      await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await peerConnection.current!.createAnswer();
      await peerConnection.current!.setLocalDescription(answer);
      socket.emit("make-answer", { to: incomingCall.from, answer });
      setTimeout(() => { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }, 500);
    } catch (err) {
      setCallType(incomingCall.type); setIsCalling(true); setIncomingCall(null); setIsDummy(true);
    }
  };

  return (
    <>
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[2000] bg-[#0b141a] flex flex-col items-center justify-around text-white p-6">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-zinc-700 rounded-full mb-4 border-4 border-yellow-400 overflow-hidden">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold">{targetUser?.name || "User"}</h2>
            <p className="text-yellow-400 mt-2">Incoming {incomingCall.type} call...</p>
          </div>
          <div className="flex gap-16">
            <button onClick={() => { socket.emit("end-call", { to: incomingCall.from }); setIncomingCall(null); }} className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"><span className="text-3xl">✕</span></button>
            <button onClick={acceptCall} className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-pulse"><span className="text-3xl text-white">✔</span></button>
          </div>
        </div>
      )}

      {isCalling && (
        <div className="fixed inset-0 z-[2100] bg-[#0b141a] flex flex-col items-center justify-center overflow-hidden">
          
          {/* Main View */}
          {!isDummy && callType === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-4 border-yellow-500 mb-6 overflow-hidden">
                <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-white text-2xl font-bold">{targetUser?.name}</h3>
              <p className="text-yellow-500 mt-2 font-mono tracking-widest">{callType === 'video' ? "VIDEO CONNECTING..." : "VOICE CALL ACTIVE"}</p>
            </div>
          )}

          {/* Self Video Overlay (Top Right) - Only for Video Call */}
          {callType === 'video' && (
            <div className="absolute top-6 right-6 w-28 h-40 border-2 border-white/20 rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl z-[2200]">
              {!isDummy ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-[10px] text-gray-400 text-center p-2">
                   <div className="w-10 h-10 rounded-full bg-zinc-700 mb-2 flex items-center justify-center text-lg">👤</div>
                   Self View
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-12">
            <button 
              onClick={() => { socket.emit("end-call", { to: targetUser?._id || incomingCall?.from }); stopAllTracks(); }} 
              className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-90 border-4 border-white/10"
            >
              <svg viewBox="0 0 24 24" width="30" height="30" fill="white" className="rotate-[135deg]"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default CallOverlay;