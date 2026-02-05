import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { Users, Power, Mic, MicOff, Video, VideoOff, User } from "lucide-react";

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Chota ID for testing
  const ASTRO_ID = "astro_01"; 

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));
    return () => { socket.off("update-viewers"); socket.off("receive-message"); };
  }, []);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 720, height: 1280 }, // Mobile portrait view
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) {
      alert("Camera on nahi ho raha! Permissions check karein.");
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        // Video tag ko wapas stream se jodne ke liye
        if (videoRef.current) videoRef.current.srcObject = streamRef.current;
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-black flex justify-center overflow-hidden">
      <div className="w-full max-w-[450px] flex flex-col relative h-full border-x border-white/10">
        
        {/* Header */}
        <div className="z-[100]"><Header /></div>

        {/* Main Content */}
        <div className="flex-1 relative overflow-hidden bg-zinc-900">
          
          {/* 1. Camera Video */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? 'hidden' : 'block'}`} 
          />

          {/* 2. Profile Photo (Jab video off ho) */}
          {isVideoOff && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800">
              <div className="w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center shadow-2xl">
                <User size={50} className="text-black" />
              </div>
              <p className="text-yellow-500 mt-4 font-bold text-sm">Host is Offline</p>
            </div>
          )}

          {/* 3. Live UI Elements */}
          {isLive && (
            <>
              {/* Top Bar */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-md">
                  <span className="text-white text-[10px] font-black uppercase tracking-tighter">Live</span>
                  <div className="w-[1px] h-3 bg-white/30" />
                  <span className="text-white text-[10px] font-bold flex items-center gap-1">
                    <Users size={12} /> {viewers}
                  </span>
                </div>
              </div>

              {/* Control Buttons (Right Side) */}
              <div className="absolute right-4 bottom-32 flex flex-col gap-4 z-50">
                <button onClick={toggleMic} className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-white/20 backdrop-blur-md'}`}>
                  {isMuted ? <MicOff size={20} color="white" /> : <Mic size={20} color="white" />}
                </button>
                <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-white/20 backdrop-blur-md'}`}>
                  {isVideoOff ? <VideoOff size={20} color="white" /> : <Video size={20} color="white" />}
                </button>
              </div>

              {/* Chat Container (Pushed Up) */}
              <div className="absolute bottom-4 left-0 w-full px-4 z-40 flex flex-col gap-2 max-h-[150px] overflow-y-auto no-scrollbar">
                {messages.map((m, i) => (
                  <div key={i} className="bg-black/30 backdrop-blur-sm p-2 rounded-lg self-start border border-white/5">
                    <p className="text-xs text-white">
                      <span className="text-yellow-400 font-bold mr-1">{m.user}:</span> {m.text}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </>
          )}

          {/* Start Button Overlay */}
          {!isLive && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-[80]">
              <div className="w-16 h-16 bg-yellow-500 rounded-full mb-6 flex items-center justify-center">
                <Power size={30} />
              </div>
              <button onClick={startLive} className="bg-yellow-500 text-black font-black px-10 py-3 rounded-full">
                START LIVE
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="z-[100]"><BottomNav /></div>
      </div>
    </div>
  );
};

export default AstroLiveHost;