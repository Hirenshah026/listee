import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import BottomNav from "./components/BottomNavNew";
import { Users, Power, Mic, MicOff, Video, VideoOff, User, X } from "lucide-react";

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
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      pcs.current[viewerId] = pc;
      streamRef.current?.getTracks().forEach(track => pc.addTrack(track, streamRef.current!));

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

    return () => {
      socket.off("new-viewer");
      socket.off("answer-from-viewer");
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
    } catch (err) { console.error(err); }
  };

  const stopLive = () => {
    socket.emit("end-stream", { astroId: ASTRO_ID });
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsLive(false);
    setMessages([]);
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
      <div className="w-full max-w-[450px] flex flex-col relative h-full border-x border-white/5">
        <div className="flex-1 relative bg-zinc-900 overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? 'hidden' : 'block'}`} />
          
          {isVideoOff && isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800">
              <User size={50} className="text-yellow-500" />
              <p className="text-yellow-500 mt-4 text-[10px] font-bold uppercase tracking-widest">Camera Off</p>
            </div>
          )}

          {isLive && (
            <>
              <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-50">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold flex items-center gap-1">
                    <Users size={14} className="text-yellow-400" /> {viewers}
                  </span>
                </div>
                <button onClick={stopLive} className="bg-red-600 w-10 h-10 flex items-center justify-center rounded-full border-2 border-white/20 shadow-xl">
                  <X size={24} className="text-white" strokeWidth={3} />
                </button>
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
                <button onClick={toggleMic} className={`p-3.5 rounded-full backdrop-blur-lg border ${isMuted ? 'bg-red-600 border-red-400' : 'bg-black/40 border-white/10'}`}>
                  {isMuted ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
                </button>
                <button onClick={toggleVideo} className={`p-3.5 rounded-full backdrop-blur-lg border ${isVideoOff ? 'bg-red-600 border-red-400' : 'bg-black/40 border-white/10'}`}>
                  {isVideoOff ? <VideoOff size={22} className="text-white" /> : <Video size={22} className="text-white" />}
                </button>
              </div>

              <div className="absolute bottom-6 left-0 w-full px-4 z-40 flex flex-col gap-2 max-h-[30%] overflow-y-auto pointer-events-none">
                {messages.map((m, i) => (
                  <div key={i} className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border-l-4 border-yellow-500 self-start max-w-[85%] pointer-events-auto shadow-lg">
                    <p className="text-[12px] text-white">
                      <span className="text-yellow-400 font-bold mr-1.5">{m.user}:</span> {m.text}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </>
          )}

          {!isLive && (
            <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[80] p-6 text-center">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                <Power size={40} className="text-yellow-500" />
              </div>
              <h2 className="text-white font-bold text-lg mb-8 uppercase tracking-widest">Astro Live Panel</h2>
              <button onClick={startLive} className="w-full max-w-[280px] bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-2xl active:scale-95 transition-all text-sm uppercase">Go Live Now</button>
            </div>
          )}
        </div>
        <div className="shrink-0 z-[100] bg-black"><BottomNav /></div>
      </div>
    </div>
  );
};
export default AstroLiveHost;