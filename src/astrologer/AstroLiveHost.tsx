import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ASTRO_ID = "6958bde63adbac9b1c1da23e";
  const ROOM_ID = `live_room_${ASTRO_ID}`;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join", ASTRO_ID); 
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { alert("Camera Permission Required"); }
  };

  useEffect(() => {
    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages(prev => [...prev, msg]));
    socket.on("new-viewer", async ({ viewerId }) => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcs.current[viewerId] = pc;
      streamRef.current?.getTracks().forEach(t => pc.addTrack(t, streamRef.current!));
      pc.onicecandidate = (e) => { if (e.candidate) socket.emit("ice-candidate", { to: viewerId, candidate: e.candidate }); };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("send-offer-to-viewer", { to: viewerId, offer });
    });
    socket.on("answer-from-viewer", async ({ from, answer }) => {
      const pc = pcs.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on("ice-candidate", ({ candidate, from }) => {
      const pc = pcs.current[from];
      if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    });
    return () => { socket.off("update-viewers"); socket.off("receive-message"); socket.off("new-viewer"); };
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
      <div className="z-[100]"><Header /></div>
      
      {/* Video Background */}
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover z-0" />

      {/* Overlays */}
      <div className="relative z-10 flex-1 flex flex-col p-4 pointer-events-none">
        {isLive && (
          <div className="mt-20 flex items-center gap-2 bg-red-600 w-fit px-3 py-1 rounded-full text-white text-[10px] font-bold animate-pulse">
            LIVE • {viewers} VIEWERS
          </div>
        )}

        {/* Chat Area */}
        <div className="mt-auto mb-28 max-h-[200px] overflow-y-auto pointer-events-auto scrollbar-hide flex flex-col gap-2">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/30 backdrop-blur-md px-3 py-2 rounded-2xl self-start max-w-[80%] border border-white/10">
              <p className="text-white text-[13px]"><span className="text-yellow-400 font-bold mr-1">{m.user}:</span> {m.text}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Control Button */}
        <div className="pointer-events-auto">
          <button 
            onClick={isLive ? () => window.location.reload() : startLive}
            className={`w-full py-4 rounded-full font-bold shadow-2xl transition-all ${isLive ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}
          >
            {isLive ? "END STREAM" : "START LIVE SESSION"}
          </button>
        </div>
      </div>

      <div className="z-[100] bg-black/80 backdrop-blur-md"><BottomNav /></div>
    </div>
  );
};
export default AstroLiveHost;
