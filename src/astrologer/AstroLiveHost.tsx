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

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join", ASTRO_ID);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { alert("Mic/Camera access denied!"); }
  };

  const stopLive = () => {
    if (window.confirm("End Live Session?")) {
      socket.emit("end-stream", { astroId: ASTRO_ID });
      streamRef.current?.getTracks().forEach(t => t.stop());
      setIsLive(false);
      setViewers(0);
      setMessages([]);
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
    return () => { socket.off("update-viewers"); socket.off("receive-message"); socket.off("new-viewer"); };
  }, []);

  return (
    // 'fixed inset-0' aur 'h-[100dvh]' layout ko hile nahi dega
    <div className="fixed inset-0 flex justify-center bg-black h-[100dvh] w-screen overflow-hidden font-sans">
      <div className="w-full max-w-[450px] relative bg-zinc-950 flex flex-col h-full overflow-hidden">
        
        {/* Header - Fixed at Top */}
        <div className="absolute top-0 w-full z-50">
          <Header />
        </div>

        {/* Video - Full Viewport */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover bg-black" 
        />

        {/* Live Badge Overlay */}
        {isLive && (
          <div className="absolute top-20 left-4 bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black z-40 animate-pulse uppercase">
            LIVE • {viewers}
          </div>
        )}

        {/* Chat Messages - Adjusted bottom padding to avoid nav overlap */}
        <div 
          ref={chatContainerRef} 
          className="absolute bottom-44 left-0 w-full px-4 max-h-[160px] overflow-y-auto z-40 flex flex-col gap-2 scrollbar-hide pb-2"
        >
          {messages.map((m, i) => (
            <div key={m.id || i} className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl self-start max-w-[85%] shadow-lg">
              <p className="text-[13px] text-white">
                <span className="font-bold text-yellow-500 mr-1">{m.user}:</span>{m.text}
              </p>
            </div>
          ))}
        </div>

        {/* Start/Stop Button - Above the BottomNav */}
        <div className="absolute bottom-24 w-full px-10 z-50">
          <button 
            onClick={isLive ? stopLive : startLive} 
            className={`w-full py-4 rounded-full font-black text-[14px] shadow-2xl active:scale-95 transition-all uppercase tracking-widest ${
              isLive ? 'bg-red-600 text-white shadow-red-900/20' : 'bg-yellow-500 text-black shadow-yellow-900/20'
            }`}
          >
            {isLive ? "Stop Live Session" : "Go Live Now"}
          </button>
        </div>

        {/* Bottom Nav - Fixed at very bottom */}
        <div className="absolute bottom-0 w-full z-50 bg-black/90 backdrop-blur-sm border-t border-white/5">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default AstroLiveHost;
