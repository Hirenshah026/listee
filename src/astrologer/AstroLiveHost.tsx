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
  const messageIds = useRef(new Set());

  const ASTRO_ID = "6958bde63adbac9b1c1da23e"; 
  const ROOM_ID = `live_room_${ASTRO_ID}`;

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video Play Error:", e));
      }
      setIsLive(true);
      
      // Dono join events bhejna zaroori hai
      socket.emit("join", ASTRO_ID); 
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) {
      alert("Please allow Camera and Mic permissions!");
    }
  };

  const stopLive = () => {
    if (window.confirm("End stream?")) {
      socket.emit("end-stream", { astroId: ASTRO_ID });
      streamRef.current?.getTracks().forEach(t => t.stop());
      setIsLive(false);
      setMessages([]);
      setViewers(0);
    }
  };

  useEffect(() => {
    socket.on("update-viewers", (count) => setViewers(count));
    
    socket.on("receive-message", (msg) => {
      if (!messageIds.current.has(msg.id)) {
        messageIds.current.add(msg.id);
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on("new-viewer", async ({ viewerId }) => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcs.current[viewerId] = pc;
      streamRef.current?.getTracks().forEach(t => pc.addTrack(t, streamRef.current!));
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("send-offer-to-viewer", { to: viewerId, offer });
    });

    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("new-viewer");
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* 1. Header Layer */}
      <div className="relative z-[100]"><Header /></div>

      {/* 2. Video Layer */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
      </div>

      {/* 3. Overlay Content (Chat & Stats) */}
      <div className="relative flex-1 z-50 pointer-events-none">
        {isLive && (
          <div className="absolute top-20 left-4 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold">
            LIVE • {viewers}
          </div>
        )}

        {/* Chat - pointer-events-auto makes it scrollable again */}
        <div ref={chatContainerRef} className="absolute bottom-48 left-0 w-full px-4 max-h-[200px] overflow-y-auto pointer-events-auto flex flex-col gap-2 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={m.id || i} className="bg-black/50 backdrop-blur-sm p-2 rounded-xl self-start border border-white/10">
              <p className="text-white text-xs"><span className="text-yellow-400 font-bold">{m.user}:</span> {m.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Controls & Navigation */}
      <div className="relative z-[100] bg-gradient-to-t from-black to-transparent pt-10 pb-2 px-6">
        <button 
          onClick={isLive ? stopLive : startLive}
          className={`w-full py-4 rounded-full font-bold mb-4 shadow-xl ${isLive ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}
        >
          {isLive ? "STOP LIVE" : "START LIVE"}
        </button>
        <BottomNav />
      </div>
    </div>
  );
};
export default AstroLiveHost;
