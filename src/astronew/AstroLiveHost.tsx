import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import { Users, Power, Mic, MicOff, Video, VideoOff, X } from "lucide-react";

const AstroLiveHost = () => {
  const { user } = useUser();
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({}); 
  const ASTRO_ID = user?._id || "6958bde63adbac9b1c1da23e";

  useEffect(() => {
    socket.emit("join", ASTRO_ID);
    socket.on("update-viewers", (count: number) => setViewers(count));

    socket.on("new-viewer", async ({ viewerId }) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      pcs.current[viewerId] = pc;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current!));
      }
      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit("ice-candidate", { to: viewerId, candidate: e.candidate });
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("send-offer-to-viewer", { to: viewerId, offer });
    });

    socket.on("answer-from-viewer", async ({ from, answer }) => {
      const pc = pcs.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    return () => { socket.off("new-viewer"); socket.off("answer-from-viewer"); };
  }, [ASTRO_ID]);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { alert("Camera Permission Required"); }
  };

  return (
    <div className="h-screen w-full bg-black flex justify-center items-center">
      <div className="w-full max-w-[450px] h-full relative bg-zinc-900">
        {/* Host Video hamesha muted preview hota hai */}
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        
        {!isLive ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <button onClick={startLive} className="bg-yellow-500 p-6 rounded-full font-bold animate-pulse"><Power size={40}/></button>
          </div>
        ) : (
          <div className="absolute top-5 left-5 bg-red-600 px-3 py-1 rounded text-white text-xs font-bold">LIVE: {viewers} viewers</div>
        )}
      </div>
    </div>
  );
};

export default AstroLiveHost;