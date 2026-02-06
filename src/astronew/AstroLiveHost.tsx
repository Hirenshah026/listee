import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import BottomNav from "./components/BottomNavNew";
import { Users, Power, Mic, MicOff, Video, VideoOff, X } from "lucide-react";

const AstroLiveHost = () => {
  const { user } = useUser();
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({}); 
  const ASTRO_ID = user?._id || "6958bde63adbac9b1c1da23e";

  useEffect(() => {
    socket.emit("join", ASTRO_ID);

    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));

    // SERVER LINE 126: new-viewer
    socket.on("new-viewer", async ({ viewerId }) => {
      console.log("Production: New viewer request from", viewerId);
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ],
        iceCandidatePoolSize: 10,
      });

      pcs.current[viewerId] = pc;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current!));
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { to: viewerId, candidate: event.candidate });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // SERVER LINE 150: send-offer-to-viewer
      socket.emit("send-offer-to-viewer", { to: viewerId, offer });
    });

    socket.on("answer-from-viewer", async ({ from, answer }) => {
      const pc = pcs.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = pcs.current[from];
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
    });

    return () => {
      socket.off("new-viewer");
      socket.off("answer-from-viewer");
      socket.off("ice-candidate");
    };
  }, [ASTRO_ID]);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { alert("Production Error: Camera/Mic Access Denied"); }
  };

  return (
    <div className="h-[100dvh] w-full bg-black flex justify-center fixed inset-0 overflow-hidden">
      <div className="w-full max-w-[450px] relative border-x border-white/5 flex flex-col">
        <div className="flex-1 relative bg-zinc-900">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          {isLive ? (
            <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-50">
              <div className="bg-red-600/90 px-3 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-2 tracking-widest">
                LIVE <span className="bg-white/20 px-2 rounded-full font-mono">{viewers}</span>
              </div>
              <button onClick={() => window.location.reload()} className="bg-black/40 p-2 rounded-full text-white"><X size={20}/></button>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 z-[60]">
               <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                 <Power size={32} />
               </div>
               <button onClick={startLive} className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl uppercase shadow-xl hover:bg-yellow-400">Go Live Production</button>
            </div>
          )}
          
          <div className="absolute bottom-6 left-4 w-full flex flex-col gap-2 max-h-[30%] overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md p-2 rounded-lg border-l-2 border-yellow-500 text-white text-xs self-start">
                <span className="font-bold text-yellow-400">{m.user}:</span> {m.text}
              </div>
            ))}
          </div>
        </div>
        <div className="shrink-0"><BottomNav /></div>
      </div>
    </div>
  );
};
export default AstroLiveHost;