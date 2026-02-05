import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { Users, Power, Mic, MicOff, Video, VideoOff } from "lucide-react";

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Controls States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ASTRO_ID = "6958bde63adbac9b1c1da23e";
  // Yahan apni real image ka link daal dena
  const HOST_IMAGE = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; 

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));
    // ... baki socket logic wahi rahega ...
    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
    };
  }, []);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) {
      alert("Microphone/Camera access required!");
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  const stopLive = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsLive(false);
    socket.emit("end-stream", { astroId: ASTRO_ID });
  };

  return (
    <div className="h-screen w-full bg-zinc-300 flex justify-center overflow-hidden font-sans">
      <div className="w-full max-w-[450px] bg-black flex flex-col relative h-full shadow-2xl">
        
        {/* 1. FIXED HEADER */}
        <div className="relative z-[100] bg-black hidden">
          <Header />
        </div>

        {/* 2. MAIN STREAM AREA */}
        <div className="flex-1 relative bg-zinc-900 overflow-hidden flex flex-col">
          
          {/* Video / Profile Display */}
          <div className="absolute inset-0 z-0">
            {isVideoOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800">
                <div className="w-32 h-32 rounded-full border-4 border-yellow-500 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                  <img src={HOST_IMAGE} className="w-full h-full object-cover" alt="Host" />
                </div>
                <p className="text-yellow-500 mt-4 font-bold tracking-widest text-xs uppercase">Camera Paused</p>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]" 
              />
            )}
          </div>

          {/* LIVE CONTROLS OVERLAY */}
          {isLive && (
            <>
              {/* Top Info */}
              <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold flex items-center gap-1">
                    <Users size={12} /> {viewers}
                  </span>
                </div>
                <button onClick={stopLive} className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase">
                  End
                </button>
              </div>

              {/* SIDE BUTTONS (Mic/Video) - Yeh ab ekdum clear dikhenge */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-5">
                <button 
                  onClick={toggleMic} 
                  className={`p-3 rounded-full shadow-xl transition-all active:scale-90 ${isMuted ? 'bg-red-600' : 'bg-white/20 backdrop-blur-lg border border-white/30'}`}
                >
                  {isMuted ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
                </button>
                <button 
                  onClick={toggleVideo} 
                  className={`p-3 rounded-full shadow-xl transition-all active:scale-90 ${isVideoOff ? 'bg-red-600' : 'bg-white/20 backdrop-blur-lg border border-white/30'}`}
                >
                  {isVideoOff ? <VideoOff size={22} className="text-white" /> : <Video size={22} className="text-white" />}
                </button>
              </div>

              {/* CHAT AREA (Positioned above footer) */}
              <div className="absolute bottom-6 left-0 w-full px-4 z-40 max-h-[30%] overflow-y-auto no-scrollbar flex flex-col gap-2">
                {messages.map((m, i) => (
                  <div key={i} className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/5 self-start max-w-[85%]">
                    <p className="text-[12px] text-white leading-tight">
                      <span className="text-yellow-400 font-bold mr-1.5">{m.user}:</span> {m.text}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </>
          )}

          {/* START OVERLAY */}
          {!isLive && (
            <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-10">
              <div className="p-6 bg-yellow-500/10 rounded-full mb-6 border border-yellow-500/20">
                 <Power size={48} className="text-yellow-500" />
              </div>
              <button 
                onClick={startLive} 
                className="w-full bg-yellow-500 text-black font-black py-4 rounded-full shadow-[0_10px_20px_rgba(234,179,8,0.3)] active:scale-95 transition-all"
              >
                START LIVE SESSION
              </button>
            </div>
          )}
        </div>

        {/* 3. FIXED FOOTER */}
        <div className="relative z-[100] bg-black border-t border-white/10">
          <BottomNav />
        </div>

      </div>
    </div>
  );
};

export default AstroLiveHost;