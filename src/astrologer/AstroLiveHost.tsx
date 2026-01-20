import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket"; // Aapka socket instance

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({}); // Multi-viewer storage

  const startLive = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;
    setIsLive(true);
    socket.emit("register-user", "ASTRO_ID_HERE"); // Astro ki apni ID
  };

  useEffect(() => {
    socket.on("new-viewer", async ({ viewerId }) => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcs.current[viewerId] = pc;

      streamRef.current?.getTracks().forEach(track => pc.addTrack(track, streamRef.current!));

      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit("ice-candidate", { to: viewerId, candidate: e.candidate });
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("send-offer-to-viewer", { to: viewerId, offer });
    });

    socket.on("answer-from-viewer", async ({ from, answer }) => {
      await pcs.current[from]?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    return () => { socket.off("new-viewer"); socket.off("answer-from-viewer"); };
  }, []);

  return (
    <div className="flex flex-col items-center bg-black h-screen justify-center text-white">
      <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-[450px] h-[70vh] object-cover rounded-2xl border-2 border-yellow-500" />
      <button onClick={startLive} className={`mt-10 px-10 py-4 rounded-full font-bold ${isLive ? 'bg-red-600' : 'bg-yellow-500 text-black'}`}>
        {isLive ? "LIVE NOW" : "GO LIVE"}
      </button>
    </div>
  );
};

export default AstroLiveHost;