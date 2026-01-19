import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../components/chat/socket";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    pc.current.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    socket.emit("join-live-room", { astroId });

    socket.on("offer-from-astro", async ({ offer, from }) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("ice-candidate", (data) => {
      pc.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    return () => { socket.off("offer-from-astro"); pc.current?.close(); };
  }, [astroId]);

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center relative">
       <video ref={remoteVideoRef} autoPlay playsInline className="w-full max-w-[450px] h-full object-cover" />
       <div className="absolute top-10 left-10 bg-red-600 px-3 py-1 rounded text-white font-bold animate-pulse">LIVE</div>
       <button onClick={() => window.history.back()} className="absolute top-10 right-10 text-white text-2xl">✕</button>
    </div>
  );
};

export default LiveCallPage;