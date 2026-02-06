import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import { Users, Power, Mic, MicOff, Video, VideoOff, X } from "lucide-react";

const AstroLiveHost = () => {
  const { user } = useUser();
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({}); 
  const ASTRO_ID = user?._id || "6958bde63adbac9b1c1da23e";

  useEffect(() => {
    socket.emit("join", ASTRO_ID);

    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));

    // Backend Line 126: new-viewer
    socket.on("new-viewer", async ({ viewerId }) => {
      console.log("Viewer Join Request:", viewerId);
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      pcs.current[viewerId] = pc;

      streamRef.current?.getTracks().forEach(track => pc.addTrack(track, streamRef.current!));

      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit("ice-candidate", { to: viewerId, candidate: e.candidate });
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Backend Line 150: send-offer-to-viewer
      socket.emit("send-offer-to-viewer", { to: viewerId, offer });
    });

    // Backend Line 155: answer-from-viewer
    socket.on("answer-from-viewer", async ({ from, answer }) => {
      const pc = pcs.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    return () => {
      socket.off("new-viewer");
      socket.off("answer-from-viewer");
      socket.off("update-viewers");
      socket.off("receive-message");
    };
  }, [ASTRO_ID]);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { alert("Mic/Camera Allow Karein!"); }
  };

  return (
    <div className="h-screen w-full bg-black relative flex items-center justify-center">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
      {!isLive ? (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
          <button onClick={startLive} className="bg-yellow-500 px-10 py-4 rounded-2xl font-black text-lg shadow-2xl">GO LIVE NOW</button>
        </div>
      ) : (
        <div className="absolute top-5 left-5 bg-red-600 px-3 py-1 rounded text-white text-xs font-bold flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE: {viewers}
        </div>
      )}
    </div>
  );
};

export default AstroLiveHost;