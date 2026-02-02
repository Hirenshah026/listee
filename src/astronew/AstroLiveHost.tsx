import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { Users, Power } from "lucide-react";

const AstroLiveHost = () => {
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
      if (!streamRef.current) return;

      setTimeout(async () => {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        });

        pcs.current[viewerId] = pc;
        streamRef.current?.getTracks().forEach((track) => {
          pc.addTrack(track, streamRef.current!);
        });

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("ice-candidate", { to: viewerId, candidate: e.candidate });
          }
        };

        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await pc.setLocalDescription(offer);
          socket.emit("send-offer-to-viewer", { to: viewerId, offer });
        } catch (err) {
          console.error("Laptop offer error:", err);
        }
      }, 1500);
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
      const constraints = { 
        video: { width: { ideal: 640 }, height: { ideal: 480 } }, 
        audio: true 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      setIsLive(true);
      setMessages([]);
      setViewers(0);
      socket.emit("join", ASTRO_ID); 
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) {
      alert("Camera error! Please use HTTPS and allow permissions.");
    }
  };

  const stopLive = () => {
    socket.emit("end-stream", { astroId: ASTRO_ID });
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    Object.values(pcs.current).forEach(pc => pc.close());
    pcs.current = {};
    setIsLive(false);
  };

  return (
    <div className="min-h-screen bg-zinc-200 flex justify-center overflow-hidden font-sans">
      <div className="w-full max-w-[450px] bg-black flex flex-col relative shadow-2xl h-screen">
        
        {/* --- Header --- */}
        <div className="absolute top-0 left-0 w-full z-[70]">
          <Header />
        </div>

        {/* --- Live Status & End Button Overlay --- */}
        {isLive && (
          <div className="absolute top-20 left-0 w-full z-50 px-4 py-2 flex justify-between items-center bg-gradient-to-b from-black/40 to-transparent">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded-full font-black text-white uppercase animate-pulse">Live</span>
              <span className="text-white text-xs flex items-center gap-1 font-bold">
                <Users size={14} className="text-yellow-500" /> {viewers}
              </span>
            </div>
            <button 
              onClick={stopLive} 
              className="bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg border border-red-400/30 transition-all active:scale-95"
            >
              STOP LIVE
            </button>
          </div>
        )}

        {/* --- Main Stream Section --- */}
        <div className="flex-1 relative bg-zinc-900 overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover" 
            style={{ transform: "scaleX(-1)" }} 
          />

          {/* --- Offline Overlay --- */}
          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-[60] p-8 text-center backdrop-blur-sm">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-yellow-500/40 animate-pulse">
                <Power size={40} className="text-yellow-500" />
              </div>
              <h2 className="text-white font-bold text-2xl mb-2 tracking-tight">READY TO GO LIVE?</h2>
              <p className="text-white/60 text-sm mb-8">Start your session to connect with viewers.</p>
              <button 
                onClick={startLive} 
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-12 py-4 rounded-full shadow-xl active:scale-95 transition-all w-full max-w-[280px] uppercase tracking-wider"
              >
                Start Stream
              </button>
            </div>
          )}

          {/* --- Chat Overlay --- */}
          {isLive && (
            <div className="absolute bottom-6 left-0 w-full px-4 flex flex-col items-start gap-2 max-h-[35%] overflow-y-auto scrollbar-hide z-40 pb-20">
              {messages.map((m, i) => (
                <div key={i} className="flex flex-col items-start max-w-[85%] animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/5 inline-block">
                    <p className="text-[13px] leading-tight">
                      <span className="text-yellow-400 font-bold mr-2">{m.user}:</span>
                      <span className="text-white/90">{m.text}</span>
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* --- Footer --- */}
        <div className="z-[70] bg-black border-t border-white/10">
          <BottomNav />
        </div>

      </div>
    </div>
  );
};

export default AstroLiveHost;