import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import { Users, X, Mic, MicOff, Video, VideoOff, Power, Send } from "lucide-react";

const AstroLiveHost = () => {
  const { user } = useUser();
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({}); 
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ASTRO_ID = user?._id || "6958bde63adbac9b1c1da23e";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("join", ASTRO_ID);
    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));

    socket.on("new-viewer", async ({ viewerId }) => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcs.current[viewerId] = pc;
      streamRef.current?.getTracks().forEach(track => pc.addTrack(track, streamRef.current!));
      pc.onicecandidate = (e) => { if (e.candidate) socket.emit("ice-candidate", { to: viewerId, candidate: e.candidate }); };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("send-offer-to-viewer", { to: viewerId, offer });
    });

    socket.on("answer-from-viewer", async ({ from, answer }) => {
      const pc = pcs.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    return () => {
      socket.off("new-viewer");
      socket.off("update-viewers");
      socket.off("receive-message");
    };
  }, [ASTRO_ID]);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { alert("Camera/Mic Permission Required"); }
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

  return (
    <div className="h-[100dvh] w-full bg-black flex justify-center fixed inset-0 overflow-hidden">
      <div className="w-full max-w-[450px] relative bg-zinc-900 shadow-2xl overflow-hidden">
        
        {/* Main Video/Camera */}
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} />
        
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-yellow-500 font-bold uppercase tracking-widest">Camera Paused</div>
        )}

        {isLive ? (
          <>
            {/* Top Bar */}
            <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-50">
              <div className="bg-red-600 px-4 py-1.5 rounded-full text-white text-[11px] font-black flex items-center gap-2 shadow-lg">
                LIVE <span className="bg-black/20 px-2 rounded-full">{viewers}</span>
              </div>
              <button onClick={() => window.location.reload()} className="bg-white/10 backdrop-blur-md p-2 rounded-full text-white border border-white/20"><X size={20}/></button>
            </div>

            {/* Right Side Controls */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-50">
              <button onClick={toggleMic} className={`p-4 rounded-full border shadow-xl transition-all ${isMuted ? 'bg-red-600 border-red-400' : 'bg-black/40 border-white/20'}`}>
                {isMuted ? <MicOff size={24} className="text-white"/> : <Mic size={24} className="text-white"/>}
              </button>
              <button onClick={toggleVideo} className={`p-4 rounded-full border shadow-xl transition-all ${isVideoOff ? 'bg-red-600 border-red-400' : 'bg-black/40 border-white/20'}`}>
                {isVideoOff ? <VideoOff size={24} className="text-white"/> : <Video size={24} className="text-white"/>}
              </button>
            </div>

            {/* Chat Area - Shifted up and made scrollable */}
            <div className="absolute bottom-[40px] left-0 w-full px-4 z-40 flex flex-col gap-2 max-h-[35%] overflow-y-auto scrollbar-hide pointer-events-none">
              {messages.map((m, i) => (
                <div key={i} className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border-l-4 border-yellow-500 self-start max-w-[85%] pointer-events-auto shadow-md">
                  <p className="text-[12px] text-white">
                    <span className="text-yellow-400 font-bold mr-1.5">{m.user}:</span> {m.text}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 z-[60]">
             <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 shadow-2xl">
                <Power size={40} className="text-yellow-500" />
             </div>
             <h1 className="text-white font-bold text-xl mb-10 tracking-widest uppercase">Astro Live Studio</h1>
             <button onClick={startLive} className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-widest">Go Live Production</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AstroLiveHost;