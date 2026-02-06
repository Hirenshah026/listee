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
  const ASTRO_ID = user?._id || "6958bde63adbac9b1c1da23e";

  useEffect(() => {
    // Register host on socket
    socket.emit("join", ASTRO_ID);

    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));

    // Jab koi viewer room join kare
    socket.on("viewer-joined", async ({ viewerId }) => {
      console.log("New viewer joined:", viewerId);
      const pc = createPeerConnection(viewerId);
      pcs.current[viewerId] = pc;
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer-to-viewer", { to: viewerId, offer, from: ASTRO_ID });
    });

    socket.on("answer-from-viewer", async ({ from, answer }) => {
      const pc = pcs.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = pcs.current[from];
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("viewer-joined");
      socket.off("answer-from-viewer");
      socket.off("ice-candidate");
    };
  }, [ASTRO_ID]);

  const createPeerConnection = (viewerId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, streamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: viewerId, candidate: event.candidate });
      }
    };

    return pc;
  };

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) {
      alert("Please allow camera/mic access to go live.");
    }
  };

  const stopLive = () => {
    socket.emit("end-stream", { astroId: ASTRO_ID });
    streamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(pcs.current).forEach(pc => pc.close());
    pcs.current = {};
    setIsLive(false);
  };

  return (
    <div className="h-[100dvh] w-full bg-black flex justify-center fixed inset-0 overflow-hidden">
      <div className="w-full max-w-[450px] flex flex-col relative border-x border-white/10">
        <div className="flex-1 relative bg-zinc-900 overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? 'hidden' : 'block'}`} />
          
          {isLive && (
            <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-50">
              <div className="bg-black/60 px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-white text-xs font-bold flex items-center gap-1"><Users size={14} /> {viewers}</span>
              </div>
              <button onClick={stopLive} className="bg-red-600 p-2 rounded-full"><X size={20} className="text-white" /></button>
            </div>
          )}

          {!isLive ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-6">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20">
                <Power size={40} className="text-yellow-500" />
              </div>
              <button onClick={startLive} className="w-full max-w-[280px] bg-yellow-500 text-black font-bold py-4 rounded-2xl uppercase tracking-tighter">Start Live Session</button>
            </div>
          ) : (
            <div className="absolute bottom-10 left-0 w-full px-4 max-h-[30%] overflow-y-auto pointer-events-none flex flex-col gap-2">
              {messages.map((m, i) => (
                <div key={i} className="bg-black/40 p-2 rounded-lg border-l-4 border-yellow-500 self-start pointer-events-auto">
                  <p className="text-xs text-white"><span className="text-yellow-400 font-bold">{m.user}:</span> {m.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 bg-black"><BottomNav /></div>
      </div>
    </div>
  );
};

export default AstroLiveHost;