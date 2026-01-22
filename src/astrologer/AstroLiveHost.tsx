import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { useNavigate } from "react-router-dom";
import { Users, Power, XCircle } from "lucide-react";

const AstroLiveHost = () => {
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ASTRO_ID = "6958bde63adbac9b1c1da23e";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages((prev) => [...prev, msg]));

    socket.on("new-viewer", async ({ viewerId }) => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcs.current[viewerId] = pc;
      streamRef.current?.getTracks().forEach((track) => pc.addTrack(track, streamRef.current!));

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
      if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    });

    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("new-viewer");
      socket.off("answer-from-viewer");
      socket.off("ice-candidate");
    };
  }, []);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join", ASTRO_ID); 
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) {
      alert("Camera/Mic Permission Required");
    }
  };

  const stopLive = () => {
    socket.emit("end-stream", { astroId: ASTRO_ID });
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    Object.values(pcs.current).forEach(pc => pc.close());
    pcs.current = {};
    setIsLive(false);
    navigate("/");
  };

  return (
    // Outer Container: Laptop par center karne ke liye
    <div className="flex justify-center bg-zinc-950 h-[100dvh] w-full fixed inset-0 font-sans overflow-hidden">
      
      {/* Main Mobile Frame */}
      <div className="w-full max-w-[450px] relative bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col border-x border-white/5">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 w-full z-50 p-4 pt-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border-2 border-yellow-500 p-0.5">
                <img src="/banners/astrouser.jpg" alt="Host" className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-none mb-1">Your Live Stream</p>
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-[9px] px-1.5 py-0.5 rounded font-black text-white uppercase tracking-tighter">Live</span>
                  <span className="text-white/80 text-[11px] flex items-center gap-1 font-medium">
                    <Users size={12} className="text-yellow-500" /> {viewers}
                  </span>
                </div>
              </div>
            </div>
            
            {isLive && (
              <button onClick={stopLive} className="bg-white/10 hover:bg-red-600/20 text-white hover:text-red-500 p-2 rounded-full transition-all">
                <XCircle size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="flex-1 bg-zinc-900 relative">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover" 
          />
          
          {/* Pre-Live UI */}
          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-[60] p-6 text-center">
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-yellow-500/50">
                <Power size={48} className="text-yellow-500 animate-pulse" />
              </div>
              <h2 className="text-white font-black text-2xl mb-2 italic">ASTRO LIVE</h2>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                Ready to guide your followers? <br/> Set your vibe and start broadcasting.
              </p>
              <button 
                onClick={startLive} 
                className="bg-yellow-500 text-black font-black px-10 py-4 rounded-2xl shadow-[0_10px_30px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all w-full"
              >
                GO LIVE NOW
              </button>
            </div>
          )}

          {/* Chat List Overlay (Visible only when Live) */}
          {isLive && (
            <div className="absolute bottom-24 left-0 w-full px-4 flex flex-col gap-2 max-h-[40%] overflow-y-auto scrollbar-hide z-40">
              <div className="flex flex-col gap-2">
                {messages.map((m, i) => (
                  <div key={i} className="animate-in slide-in-from-left-2 duration-300">
                    <div className="bg-black/30 backdrop-blur-md border border-white/5 px-3 py-2 rounded-xl inline-block max-w-[90%]">
                      <p className="text-[13px] leading-snug">
                        <span className="text-yellow-400 font-bold mr-1.5">{m.user}</span>
                        <span className="text-white/90 font-medium">{m.text}</span>
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Nav Space */}
        <div className="bg-black pt-1">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default AstroLiveHost;
