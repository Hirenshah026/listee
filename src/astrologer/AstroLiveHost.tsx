import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
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
      setMessages([]);
      setViewers(0);
      
      socket.emit("join", ASTRO_ID); 
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) {
      console.error("Permission denied");
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
    <div className="flex justify-center bg-zinc-950 h-[100dvh] w-full fixed inset-0 font-sans overflow-hidden">
      <div className="w-full max-w-[450px] relative bg-black shadow-2xl flex flex-col border-x border-white/5">
        
        {/* Updated Header with END LIVE Button */}
        <div className="absolute top-0 left-0 w-full z-50 p-4 pt-6 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border-2 border-yellow-500 p-0.5 overflow-hidden">
                <img src="/banners/astrouser.jpg" alt="Host" className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                <p className="text-white text-sm font-bold tracking-tight">Astro Master</p>
                {isLive && (
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-[9px] px-1.5 py-0.5 rounded font-black text-white uppercase animate-pulse">Live</span>
                    <span className="text-white/80 text-[11px] flex items-center gap-1 font-medium">
                      <Users size={12} className="text-yellow-500" /> {viewers}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Professional End Live Button */}
            {isLive && (
              <button 
                onClick={stopLive} 
                className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all active:scale-90 shadow-lg border border-red-500/50"
              >
                END LIVE
              </button>
            )}
          </div>
        </div>

        {/* Video Display */}
        <div className="flex-1 bg-zinc-900 relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          
          {/* Main Action Area when Not Live */}
          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-[60] p-8 text-center">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/30">
                <Power size={40} className="text-yellow-500" />
              </div>
              <h2 className="text-white font-bold text-2xl mb-2 tracking-tight">Broadcast Center</h2>
              <p className="text-zinc-500 text-sm mb-10 leading-relaxed px-4">Ready to start your session? Click below to begin streaming to your audience.</p>
              <button 
                onClick={startLive} 
                className="bg-yellow-500 text-black font-black px-10 py-4 rounded-2xl shadow-[0_10px_30px_rgba(234,179,8,0.4)] active:scale-95 transition-all w-full tracking-wider uppercase"
              >
                Start Live Now
              </button>
            </div>
          )}

          {/* Chat Messages */}
          {isLive && (
            <div className="absolute bottom-24 left-0 w-full px-4 flex flex-col gap-2 max-h-[40%] overflow-y-auto scrollbar-hide z-40">
              {messages.map((m, i) => (
                <div key={i} className="animate-in slide-in-from-left-2 duration-200">
                  <div className="bg-black/30 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-xl self-start max-w-[85%]">
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

        {/* Bottom Navigation */}
        <div className="bg-black border-t border-white/5">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default AstroLiveHost;
