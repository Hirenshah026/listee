import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import BottomNav from "./components/BottomNavNew";
import { Users, Power, Mic, MicOff, Video, VideoOff, User, X } from "lucide-react";

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ASTRO_ID = "astro_01"; 

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));
    
    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
    };
  }, []);

  const startLive = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }, // Force Front Camera
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) {
      setError("Camera/Mic access required to go live.");
    }
  };

  const stopLive = () => {
    socket.emit("end-stream", { astroId: ASTRO_ID });
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsLive(false);
    setMessages([]);
    setViewers(0);
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-black flex justify-center overflow-hidden fixed inset-0">
      <div className="w-full max-w-[450px] flex flex-col relative h-full">
        
        {/* Main Content Area */}
        <div className="flex-1 relative bg-zinc-900 overflow-hidden">
          
          {/* Video Feed */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? 'invisible' : 'visible'}`} 
          />

          {/* Camera Off State (Profile) */}
          {isVideoOff && isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
              <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-yellow-500 flex items-center justify-center shadow-2xl">
                <User size={50} className="text-yellow-500" />
              </div>
              <p className="text-yellow-500 mt-4 text-xs font-bold uppercase tracking-widest">Camera Off</p>
            </div>
          )}

          {/* UI Elements (Only when Live) */}
          {isLive && (
            <>
              {/* Top Viewers Count & End Button */}
              <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-50">
                <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-white text-[12px] font-bold flex items-center gap-1">
                    <Users size={14} className="text-yellow-400" /> {viewers}
                  </span>
                </div>

                <button 
                  onClick={stopLive} 
                  className="bg-red-600 w-10 h-10 flex items-center justify-center rounded-full border-2 border-white/20 shadow-xl active:scale-90"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>

              {/* Side Controls (Solid Background for Visibility) */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50 bg-black/40 p-2 rounded-2xl backdrop-blur-md">
                <button 
                  onClick={toggleMic} 
                  className={`p-3 rounded-full transition-all ${isMuted ? 'bg-red-600 shadow-inner' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {isMuted ? <MicOff size={24} color="white" /> : <Mic size={24} color="white" />}
                </button>
                <button 
                  onClick={toggleVideo} 
                  className={`p-3 rounded-full transition-all ${isVideoOff ? 'bg-red-600 shadow-inner' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {isVideoOff ? <VideoOff size={24} color="white" /> : <Video size={24} color="white" />}
                </button>
              </div>

              {/* Chat - Positioned above BottomNav */}
              <div className="absolute bottom-6 left-0 w-full px-4 z-40 flex flex-col gap-2 max-h-[30%] overflow-y-auto no-scrollbar pointer-events-none">
                {messages.map((m, i) => (
                  <div key={i} className="bg-black/50 backdrop-blur-md p-2 rounded-lg self-start max-w-[85%] border-l-2 border-yellow-500 pointer-events-auto">
                    <p className="text-[12px] leading-tight">
                      <span className="text-yellow-400 font-bold mr-1.5">{m.user}:</span>
                      <span className="text-white">{m.text}</span>
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </>
          )}

          {/* Start Screen Overlay */}
          {!isLive && (
            <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[80] p-6 text-center">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                <Power size={40} className="text-black" />
              </div>
              {error && <p className="text-red-500 mb-4 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>}
              <button 
                onClick={startLive} 
                className="w-full max-w-[280px] bg-yellow-500 text-black font-black py-4 rounded-xl shadow-2xl active:scale-95 transition-all text-lg uppercase"
              >
                Go Live
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="shrink-0 z-[100] bg-black">
          <BottomNav />
        </div>

      </div>
    </div>
  );
};

export default AstroLiveHost;