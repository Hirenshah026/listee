import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const ASTRO_ID = "6958bde63adbac9b1c1da23e";

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      
      // Step 1: Mapping ke liye
      socket.emit("join", ASTRO_ID); 
      // Step 2: Live Room Join (For Chat & Count)
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { alert("Camera access denied!"); }
  };

  useEffect(() => {
    socket.on("update-viewers", (count) => setViewers(count));
    
    socket.on("receive-message", (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => {
        if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }, 100);
    });

    socket.on("new-viewer", async ({ viewerId }) => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcs.current[viewerId] = pc;
      streamRef.current?.getTracks().forEach(t => pc.addTrack(t, streamRef.current!));

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

    socket.on("ice-candidate", ({ candidate, from }) => {
      const pc = pcs.current[from];
      if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
    });

    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("new-viewer");
      socket.off("answer-from-viewer");
      socket.off("ice-candidate");
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans overflow-hidden">
      <div className="z-50"><Header /></div>
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="relative z-10 flex-1 flex flex-col justify-end p-4 pb-32 pointer-events-none">
        {isLive && <div className="absolute top-24 left-4 bg-red-600 px-2 py-1 rounded text-white text-[10px] font-bold uppercase tracking-widest">LIVE • {viewers}</div>}
        <div ref={chatContainerRef} className="max-h-[160px] overflow-y-auto flex flex-col gap-2 mb-4 scrollbar-hide pointer-events-auto">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/50 backdrop-blur-md p-2 rounded-xl text-white text-xs self-start max-w-[80%] border border-white/10">
              <span className="text-yellow-400 font-bold">{m.user}: </span>{m.text}
            </div>
          ))}
        </div>
        <button onClick={isLive ? () => window.location.reload() : startLive} className={`w-full py-4 rounded-full font-bold pointer-events-auto transition-all ${isLive ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>
          {isLive ? "STOP LIVE" : "START LIVE SESSION"}
        </button>
      </div>
      <div className="z-50 bg-black"><BottomNav /></div>
    </div>
  );
};
export default AstroLiveHost;
