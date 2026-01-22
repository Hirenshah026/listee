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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const ASTRO_ID = "6958bde63adbac9b1c1da23e"; 

  // Host Message Receiver - IMPORTANT
  useEffect(() => {
    socket.on("receive-message", (msg) => {
      console.log("LOG: Host Received Message ->", msg); // Check console
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("update-viewers", (count) => {
      console.log("LOG: Viewers Count Updated ->", count);
      setViewers(count);
    });

    socket.on("new-viewer", async ({ viewerId }) => {
      console.log("LOG: New Viewer Found ->", viewerId);
      if (pcs.current[viewerId]) return;
      
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
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
      console.log("LOG: Answer Received from ->", from);
      const pc = pcs.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    return () => {
      socket.off("receive-message");
      socket.off("update-viewers");
      socket.off("new-viewer");
      socket.off("answer-from-viewer");
    };
  }, []);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      
      // Emit Join Events
      socket.emit("join", ASTRO_ID);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
      console.log("LOG: Host Started Live and Joined Room");
    } catch (err) { alert("Camera Permission Required"); }
  };

  return (
    <div className="flex justify-center bg-black h-screen overflow-hidden">
      <div className="w-full max-w-[450px] flex flex-col relative border-x border-zinc-800">
        <Header />
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover bg-zinc-900" />
        {isLive && <div className="absolute top-20 left-4 bg-red-600 px-2 py-1 text-white text-[10px] font-bold rounded animate-pulse">LIVE: {viewers}</div>}
        
        {/* Chat Area */}
        <div ref={chatContainerRef} className="absolute bottom-40 left-0 w-full px-4 max-h-[150px] overflow-y-auto z-50 flex flex-col gap-1">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/40 text-white text-xs p-2 rounded-lg border border-white/10 backdrop-blur-sm">
              <span className="text-yellow-400 font-bold">{m.user}:</span> {m.text}
            </div>
          ))}
        </div>

        <div className="absolute bottom-20 w-full px-8">
          <button onClick={startLive} className={`w-full py-4 rounded-full font-bold ${isLive ? 'bg-red-600' : 'bg-yellow-500'}`}>
            {isLive ? "LIVE ACTIVE" : "GO LIVE"}
          </button>
        </div>
        <BottomNav />
      </div>
    </div>
  );
};
export default AstroLiveHost;
