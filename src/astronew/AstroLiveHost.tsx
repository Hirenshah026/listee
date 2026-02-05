import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { Users, Power, Mic, MicOff, Video, VideoOff, User, X } from "lucide-react";

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ASTRO_ID = "astro_01"; 

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket setup
  useEffect(() => {
    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));
    
    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
    };
  }, []);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) {
      alert("Camera access denied! Please allow permissions.");
    }
  };

  const stopLive = () => {
    if (window.confirm("Do you want to end the live stream?")) {
      socket.emit("end-stream", { astroId: ASTRO_ID });
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setIsLive(false);
      setMessages([]);
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0];
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      track.enabled = !track.enabled;
      setIsVideoOff(!track.enabled);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-black flex justify-center overflow-hidden fixed inset-0">
      <div className="w-full max-w-[450px] flex flex-col relative h-full">
        
        {/* --- Header Area --- */}
        <div className="relative z-[100] bg-black/50 backdrop-blur-sm">
          <Header />
        </div>

        {/* --- Main Viewport --- */}
        <div className="flex-1 relative bg-zinc-900 overflow-hidden">
          
          {/* Video Feed */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover scale-x-[-1] transition-opacity ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} 
          />

          {/* Profile Photo (Camera Off State) */}
          {isVideoOff && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
              <div className="w-28 h-28 rounded-full bg-zinc-800 border-2 border-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                <User size={60} className="text-yellow-500" />
              </div>
              <p className="text-white/40 mt-4 text-xs font-bold tracking-widest uppercase">Camera Off</p>
            </div>
          )}

          {/* --- Live UI Overlays --- */}
          {isLive && (
            <>
              {/* Top Info Bar */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-[50]">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-white text-[11px] font-black uppercase">Live</span>
                  <div className="w-[1px] h-3 bg-white/20 mx-1" />
                  <span className="text-white text-[11px] font-bold flex items-center gap-1">
                    <Users size={12} className="text-yellow-400" /> {viewers}
                  </span>
                </div>

                {/* END BUTTON - Now highly visible */}
                <button 
                  onClick={stopLive} 
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-transform active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Side Media Controls */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-[50]">
                <button 
                  onClick={toggleMic} 
                  className={`p-3 rounded-full backdrop-blur-md border ${isMuted ? 'bg-red-600 border-red-400' : 'bg-white/10 border-white/20'}`}
                >
                  {isMuted ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
                </button>
                <button 
                  onClick={toggleVideo} 
                  className={`p-3 rounded-full backdrop-blur-md border ${isVideoOff ? 'bg-red-600 border-red-400' : 'bg-white/10 border-white/20'}`}
                >
                  {isVideoOff ? <VideoOff size={22} className="text-white" /> : <Video size={22} className="text-white" />}
                </button>
              </div>

              {/* Chat Overlay */}
              <div className="absolute bottom-6 left-0 w-full px-4 z-40 flex flex-col gap-2 max-h-[35%] overflow-y-auto no-scrollbar pointer-events-none">
                {messages.map((m, i) => (
                  <div key={i} className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 self-start max-w-[85%] pointer-events-auto animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-[12px] leading-snug">
                      <span className="text-yellow-400 font-bold mr-1.5">{m.user}:</span>
                      <span className="text-white">{m.text}</span>
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </>
          )}

          {/* Start Stream Overlay */}
          {!isLive && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-[90] p-6 text-center">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-8 border border-yellow-500/30">
                <Power size={40} className="text-yellow-500" />
              </div>
              <h2 className="text-white text-xl font-bold mb-6">Connect with your audience</h2>
              <button 
                onClick={startLive} 
                className="w-full max-w-[250px] bg-yellow-500 text-black font-black py-4 rounded-full shadow-2xl active:scale-95 transition-all uppercase tracking-widest"
              >
                Go Live
              </button>
            </div>
          )}
        </div>

        {/* --- Footer Area --- */}
        <div className="relative z-[100] bg-black border-t border-white/10">
          <BottomNav />
        </div>

      </div>
    </div>
  );
};

export default AstroLiveHost;