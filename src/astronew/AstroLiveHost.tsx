import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { Users, Power, Mic, MicOff, Video, VideoOff } from "lucide-react";

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Media States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ASTRO_ID = "6958bde63adbac9b1c1da23e";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));

    socket.on("new-viewer", async ({ viewerId }) => {
      if (!streamRef.current) return;
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcs.current[viewerId] = pc;
      streamRef.current.getTracks().forEach((track) => pc.addTrack(track, streamRef.current!));

      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit("ice-candidate", { to: viewerId, candidate: e.candidate });
      };

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
    } catch (err) {
      alert("Camera error!");
    }
  };

  // Toggle Audio
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const stopLive = () => {
    socket.emit("end-stream", { astroId: ASTRO_ID });
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsLive(false);
  };

  return (
    <div className="min-h-screen bg-zinc-200 flex justify-center overflow-hidden font-sans">
      <div className="w-full max-w-[450px] bg-black flex flex-col relative shadow-2xl h-[100dvh]">
        
        <div className="absolute top-0 left-0 w-full z-[70]"><Header /></div>

        {isLive && (
          <>
            {/* Status Bar */}
            <div className="absolute top-20 left-0 w-full z-50 px-4 flex justify-between items-center">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded-full font-black text-white animate-pulse">Live</span>
                <span className="text-white text-xs flex items-center gap-1"><Users size={14} /> {viewers}</span>
              </div>
              <button onClick={stopLive} className="bg-red-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full">STOP</button>
            </div>

            {/* Media Controls (Floating Side Bar) */}
            <div className="absolute right-4 top-1/3 z-50 flex flex-col gap-4">
              <button onClick={toggleMic} className={`p-3 rounded-full backdrop-blur-md border ${isMuted ? 'bg-red-500 border-red-400' : 'bg-black/40 border-white/20'}`}>
                {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
              </button>
              <button onClick={toggleVideo} className={`p-3 rounded-full backdrop-blur-md border ${isVideoOff ? 'bg-red-500 border-red-400' : 'bg-black/40 border-white/20'}`}>
                {isVideoOff ? <VideoOff size={20} className="text-white" /> : <Video size={20} className="text-white" />}
              </button>
            </div>
          </>
        )}

        <div className="flex-1 relative bg-zinc-900 overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} style={{ transform: "scaleX(-1)" }} />
          {isVideoOff && isLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-white/40 italic">Camera is Off</div>
          )}

          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-[60] p-8 text-center">
              <button onClick={startLive} className="bg-yellow-500 text-black font-black px-12 py-4 rounded-full uppercase">Start Stream</button>
            </div>
          )}

          {/* Chat Overlay - Adjusted to stay ABOVE BottomNav */}
          {isLive && (
            <div className="absolute bottom-[80px] left-0 w-full px-4 flex flex-col gap-2 max-h-[30%] overflow-y-auto z-40 pb-2">
              {messages.map((m, i) => (
                <div key={i} className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 self-start max-w-[85%]">
                  <p className="text-[13px] text-white">
                    <span className="text-yellow-400 font-bold mr-2">{m.user}:</span>{m.text}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="z-[70] bg-black border-t border-white/10">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default AstroLiveHost;