import React, { useEffect, useRef, useState } from "react";
import socket from "../components/chat/socket";

interface CallOverlayProps {
  userId: string | undefined;
  targetUser: any;
}

const CallOverlay: React.FC<CallOverlayProps> = ({ userId, targetUser }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!userId) return;
    socket.on("call-made", (data) => setIncomingCall(data));
    socket.on("answer-made", async ({ answer }) => {
      if (peerConnection.current) await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      try { if (peerConnection.current) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
    });
    socket.on("call-ended", () => stopAllTracks());
    return () => {
      socket.off("call-made"); socket.off("answer-made"); socket.off("ice-candidate"); socket.off("call-ended");
    };
  }, [userId]);

  const stopAllTracks = () => {
    localStream?.getTracks().forEach(t => t.stop());
    peerConnection.current?.close();
    setIsCalling(false); setIncomingCall(null); setLocalStream(null);
  };

  const startCall = async (type: 'voice' | 'video') => {
    if (!targetUser) return;
    setCallType(type); setIsCalling(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    peerConnection.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));
    peerConnection.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit("ice-candidate", { to: targetUser._id, candidate: e.candidate });
    };
    peerConnection.current.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("call-user", { to: targetUser._id, offer, from: userId, type });
  };

  const acceptCall = async () => {
    const { from, offer, type } = incomingCall;
    setCallType(type); setIsCalling(true); setIncomingCall(null);
    const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    peerConnection.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));
    peerConnection.current.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
    peerConnection.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit("ice-candidate", { to: from, candidate: e.candidate });
    };
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    socket.emit("make-answer", { to: from, answer });
  };

  const endCall = () => {
    socket.emit("end-call", { to: targetUser?._id || incomingCall?.from });
    stopAllTracks();
  };

  return (
    <>
      {!isCalling && !incomingCall && targetUser && (
        <div className="absolute top-3 right-12 flex gap-5 z-50">
          <button onClick={() => startCall('video')} className="text-xl">📹</button>
          <button onClick={() => startCall('voice')} className="text-xl">📞</button>
        </div>
      )}
      {incomingCall && !isCalling && (
        <div className="absolute inset-0 z-[600] bg-[#0b141a] flex flex-col items-center justify-center p-10 text-white">
          <div className="text-center mb-20">
            <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 border-2 border-yellow-400 overflow-hidden">
              <img src="/banners/astrouser.jpg" className="w-full h-full object-cover" alt="user" />
            </div>
            <h2 className="text-2xl font-bold">Incoming {incomingCall.type} Call</h2>
            <p className="text-green-400 animate-pulse">User is calling you...</p>
          </div>
          <div className="flex gap-16">
            <button onClick={() => setIncomingCall(null)} className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-white font-bold">✖</button>
            <button onClick={acceptCall} className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-bounce text-white font-bold">✔</button>
          </div>
        </div>
      )}
      {isCalling && (
        <div className="fixed inset-0 z-[700] bg-black flex flex-col items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {callType === 'video' && (
            <div className="absolute top-6 right-6 w-28 h-40 border-2 border-white rounded-lg overflow-hidden bg-gray-900 shadow-2xl">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          )}
          <div className="absolute bottom-10 flex justify-center w-full">
            <button onClick={endCall} className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center shadow-xl">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CallOverlay;