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
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ASTRO_ID = "6958bde63adbac9b1c1da23e";
  const PROFILE_IMAGE = "https://via.placeholder.com/150"; // Aap apni image ka URL yahan daal sakte hain

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));

    socket.on("new-viewer", async ({ viewerId }) => {
      if (!streamRef.current) return;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcs.current[viewerId] = pc;
      streamRef.current.getTracks().forEach((track) => pc.addTrack(track, streamRef.current!));
      pc.onicecandidate = (e) => { if (e.candidate) socket.emit("ice-candidate", { to: viewerId, candidate: e.candidate }); };
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

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { alert("Camera Permission Denied"); }
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

  const stopLive = () => {
    socket.emit("end-stream", { astroId: ASTRO_ID });
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsLive(false);
  };

  return (
    <div className="h-screen w-full bg-zinc-200 flex justify-center overflow-hidden">
      {/* Container fix for exact Mobile Height */}
      <div className="w-full max-w-[450px] bg-black flex flex-col relative shadow-2xl h-full">
        
        {/* --- FIXED HEADER --- */}
        <div className="shrink-0 z-[70]">
          <Header />
        </div>

        {/* --- MAIN CONTENT (Stream + Chat) --- */}
        <div className="flex-1 relative bg-zinc-900 overflow-hidden">
          
          {/* Video / Profile Photo */}
          {isLive && isVideoOff ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
              <div className="w-32 h-32 rounded-full border-4 border-yellow-500 overflow-hidden shadow-2xl">
                <img src={PROFILE_IMAGE} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <p className="text-white/50 mt-4 font-medium">Camera is Paused</p>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover" 
              style={{ transform: "scaleX(-1)" }} 
            />
          )}

          {/* Status Overlay */}
          {isLive && (
            <div className="absolute top-4 left-0 w-full z-20 px-4 flex justify-between items-center">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded-full font-black text-white animate-pulse">Live</span>
                <span className="text-white text-xs flex items-center gap-1 font-bold"><Users size={14} /> {viewers}</span>
              </div>
              <button onClick={stopLive} className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg">STOP LIVE</button>
            </div>
          )}

          {/* Side Controls */}
          {isLive && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
              <button onClick={toggleMic} className={`p-3 rounded-full backdrop-blur-md border transition-colors ${isMuted ? 'bg-red-500 border-red-400' : 'bg-white/10 border-white/20'}`}>
                {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
              </button>
              <button onClick={toggleVideo} className={`p-3 rounded-full backdrop-blur-md border transition-colors ${isVideoOff ? 'bg-red-500 border-red-400' : 'bg-white/10 border-white/20'}`}>
                {isVideoOff ? <VideoOff size={20} className="text-white" /> : <Video size={20} className="text-white" />}
              </button>
            </div>
          )}

          {/* Start Screen Overlay */}
          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-[60] p-6 text-center backdrop-blur-sm">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-yellow-500/40 animate-pulse">
                <Power size={40} className="text-yellow-500" />
              </div>
              <button onClick={startLive} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-12 py-4 rounded-full w-full max-w-[280px] uppercase shadow-xl transition-transform active:scale-95">
                Go Live Now
              </button>
            </div>
          )}

          {/* --- CHAT SECTION (Properly Padded) --- */}
          {isLive && (
            <div className="absolute bottom-4 left-0 w-full px-4 flex flex-col gap-2 max-h-[35%] overflow-y-auto z-20 pb-4 no-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 self-start max-w-[85%] animate-in slide-in-from-bottom-1">
                  <p className="text-[13px] text-white">
                    <span className="text-yellow-400 font-bold mr-2">{m.user}:</span>{m.text}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* --- FIXED FOOTER --- */}
        <div className="shrink-0 z-[70] bg-black border-t border-white/10">
          <BottomNav />
        </div>

      </div>
    </div>
  );
};

export default AstroLiveHost;