import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import BottomNav from "./components/BottomNavNew";
import { Users, Power, X, Mic, Video } from "lucide-react";

const AstroLiveHost = () => {
  const { user } = useUser();
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({}); 
  const chatEndRef = useRef<HTMLDivElement>(null); // For smooth scroll

  const ASTRO_ID = user?._id || "6958bde63adbac9b1c1da23e";

  // Smooth Scroll Logic
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

    return () => { socket.off("new-viewer"); socket.off("answer-from-viewer"); socket.off("receive-message"); };
  }, [ASTRO_ID]);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { alert("Mic/Camera Required"); }
  };

  return (
    <div className="h-[100dvh] w-full bg-black flex justify-center fixed inset-0 overflow-hidden">
      <div className="w-full max-w-[450px] relative flex flex-col border-x border-white/10">
        <div className="flex-1 relative bg-zinc-900 overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          
          {isLive && (
            <>
              {/* Header */}
              <div className="absolute top-6 left-4 right-4 flex justify-between z-50">
                <div className="bg-red-600 px-3 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-2 uppercase tracking-tighter">
                  LIVE <span className="bg-black/20 px-2 rounded-full">{viewers}</span>
                </div>
                <button onClick={() => window.location.reload()} className="bg-black/40 p-2 rounded-full text-white"><X size={20}/></button>
              </div>

              {/* Chat - Bottom Adjusted & Smooth */}
              <div className="absolute bottom-[20px] left-0 w-full px-4 z-40 max-h-[250px] overflow-y-auto flex flex-col gap-2 scrollbar-hide">
                {messages.map((m, i) => (
                  <div key={i} className="bg-black/50 backdrop-blur-md p-2.5 rounded-xl border-l-4 border-yellow-500 self-start animate-fade-in shadow-lg">
                    <p className="text-[12px] text-white">
                      <span className="text-yellow-400 font-black mr-1">{m.user}:</span> {m.text}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </>
          )}

          {!isLive && (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 z-[60]">
               <button onClick={startLive} className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl uppercase shadow-[0_0_30px_rgba(234,179,8,0.4)]">Go Live Now</button>
            </div>
          )}
        </div>
        {/* Nav Bottom me rahega isliye chat ko 20px bottom margin diya hai upar */}
        <div className="shrink-0 z-[100]"><BottomNav /></div>
      </div>
    </div>
  );
};
export default AstroLiveHost;