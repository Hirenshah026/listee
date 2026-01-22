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
  const ASTRO_ID = "6958bde63adbac9b1c1da23e"; // Aapki Astro ID
  const messageIds = useRef(new Set());

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      
      socket.emit("join", ASTRO_ID);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { 
      alert("Please allow Camera/Mic access."); 
    }
  };

  const stopLive = () => {
    socket.emit("end-stream", { astroId: ASTRO_ID });
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    Object.values(pcs.current).forEach(pc => pc.close());
    pcs.current = {};
    setIsLive(false);
    setViewers(0);
    setMessages([]);
  };

  useEffect(() => {
    // WebRTC Signaling Logic
    socket.on("new-viewer", async ({ viewerId }) => {
      console.log("New Viewer:", viewerId);
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
      const pc = pcs.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = pcs.current[from];
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("update-viewers", (count) => setViewers(count));

    socket.on("receive-message", (msg) => {
      if (!messageIds.current.has(msg.id)) {
        messageIds.current.add(msg.id);
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("new-viewer");
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("answer-from-viewer");
      socket.off("ice-candidate");
    };
  }, []);

  return (
    <div className="flex justify-center bg-black h-screen overflow-hidden">
      <div className="w-full max-w-[450px] flex flex-col bg-zinc-900 relative">
        <Header />
        <main className="flex-1 relative overflow-hidden bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          
          {isLive && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-[10px] font-bold z-20">
              LIVE • {viewers}
            </div>
          )}

          {/* Messages */}
          <div ref={chatContainerRef} className="absolute bottom-32 left-0 w-full px-4 max-h-[180px] overflow-y-auto z-20 flex flex-col gap-2 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={m.id || i} className="flex items-start">
                <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-white text-xs">
                  <span className="font-bold text-yellow-500 mr-1">{m.user}:</span>{m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-10 w-full px-10 z-30">
            <button onClick={isLive ? stopLive : startLive} className={`w-full py-4 rounded-full font-bold shadow-2xl ${isLive ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>
              {isLive ? "END LIVE" : "GO LIVE"}
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
};
export default AstroLiveHost;
