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
  const messageIds = useRef(new Set());

  // Yeh ID aapke database se match honi chahiye
  const ASTRO_ID = "6958bde63adbac9b1c1da23e"; 

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Start Live Function
  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      
      // Backend ko inform karna
      socket.emit("join", ASTRO_ID);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
      console.log("Host joined room");
    } catch (err) {
      alert("Camera/Mic access denied! Please check permissions.");
    }
  };

  // Stop Live Function (Jo gayab ho gaya tha)
  const stopLive = () => {
    if (window.confirm("Are you sure you want to end the live?")) {
      socket.emit("end-stream", { astroId: ASTRO_ID });
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;

      // Close all peer connections
      Object.values(pcs.current).forEach(pc => pc.close());
      pcs.current = {};

      setIsLive(false);
      setViewers(0);
      setMessages([]);
      messageIds.current.clear();
    }
  };

  useEffect(() => {
    // 1. New Viewer joins -> WebRTC Offer
    socket.on("new-viewer", async ({ viewerId }) => {
      console.log("New viewer joined:", viewerId);
      if (pcs.current[viewerId]) return;
      
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

    // 2. Update Viewer Count
    socket.on("update-viewers", (count) => {
      console.log("Count update received:", count);
      setViewers(count);
    });

    // 3. Receive Chat Messages
    socket.on("receive-message", (msg) => {
      console.log("Message received on host:", msg);
      if (!messageIds.current.has(msg.id)) {
        messageIds.current.add(msg.id);
        setMessages((prev) => [...prev, msg]);
      }
    });

    // 4. WebRTC Answer from Viewer
    socket.on("answer-from-viewer", async ({ from, answer }) => {
      const pc = pcs.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // 5. ICE Candidate
    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = pcs.current[from];
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
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
    <div className="flex justify-center bg-zinc-950 h-[100dvh] overflow-hidden font-sans">
      <div className="w-full max-w-[450px] flex flex-col bg-black relative border-x border-zinc-800 shadow-2xl">
        <Header />
        <main className="flex-1 relative bg-zinc-900 flex items-center justify-center overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          
          {/* Live Badge */}
          {isLive && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider z-20 animate-pulse">
              LIVE • {viewers}
            </div>
          )}

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="absolute bottom-32 left-0 w-full px-4 max-h-[180px] overflow-y-auto z-20 flex flex-col gap-2 pointer-events-auto scrollbar-hide"
          >
            {messages.map((m, i) => (
              <div key={m.id || i} className="flex items-start">
                <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-2xl rounded-tl-none max-w-[85%]">
                  <p className="text-[13px] leading-tight text-white">
                    <span className="font-bold text-yellow-500 mr-1">{m.user}:</span>
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Control Button */}
          <div className="absolute bottom-10 w-full px-10 z-10">
            <button 
              onClick={isLive ? stopLive : startLive} 
              className={`w-full py-4 rounded-full font-bold transition-all shadow-lg active:scale-95 ${
                isLive ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'
              }`}
            >
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
