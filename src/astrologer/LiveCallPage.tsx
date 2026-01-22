import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket"; 
import { X, Volume2, VolumeX, Users, Send } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef(new Set());

  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Auto-scroll logic
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    // 1. Connection & Room Join Logic
    const onConnect = () => {
      console.log("✅ Socket Connected! Joining Room...");
      socket.emit("join-live-room", { astroId, role: "viewer" });
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);

    // 2. Listeners
    socket.on("update-viewers", (count) => {
      console.log("👥 Viewer Count Received:", count);
      setViewers(count);
    });

    socket.on("receive-message", (msg) => {
      console.log("📩 New Message Received:", msg);
      if (!messageIds.current.has(msg.id)) {
        messageIds.current.add(msg.id);
        setMessages((prev) => [...prev, msg]);
      }
    });

    // WebRTC Logic
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("Live");
      }
    };

    socket.on("offer-from-astro", async ({ offer, from }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("stream-ended", () => navigate(-1));

    return () => {
      socket.off("connect", onConnect);
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("offer-from-astro");
      socket.off("stream-ended");
      if (pc.current) pc.current.close();
    };
  }, [astroId, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msgId = `msg-${Date.now()}-${Math.random()}`;
    const myMsg = { 
      roomId: `live_room_${astroId}`, 
      user: "You", 
      text: chatInput, 
      id: msgId 
    };

    // UI par turant dikhao
    setMessages((prev) => [...prev, myMsg]);
    messageIds.current.add(msgId);

    // Server ko bhejo
    socket.emit("send-message", myMsg);
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-black h-screen w-full fixed inset-0 font-sans overflow-hidden">
      <div className="w-full max-w-[450px] relative bg-zinc-900 flex flex-col h-full shadow-2xl">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 z-[100] flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden bg-zinc-800">
              <img src="/banners/astrouser.jpg" alt="Astro" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-white text-sm font-bold">Astro Live</h3>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded font-black text-white">LIVE</span>
                <span className="text-white text-xs flex items-center gap-1 font-bold">
                  <Users size={12} className="text-yellow-500" /> {viewers}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full text-white"><X size={20} /></button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" />
          
          {/* Messages Container - YAHAN HAI CHAT BOX */}
          <div 
            ref={chatContainerRef}
            className="absolute bottom-24 left-0 w-full px-4 h-[250px] overflow-y-auto z-[90] flex flex-col gap-2 pointer-events-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {messages.map((m, i) => (
              <div key={m.id || i} className="flex flex-col items-start">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-lg max-w-[90%]">
                  <p className="text-[11px] font-bold text-yellow-400">{m.user}</p>
                  <p className="text-white text-sm">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {status === "Live" && isMuted && (
            <button onClick={() => setIsMuted(false)} className="absolute inset-0 m-auto w-16 h-16 bg-yellow-500/40 rounded-full flex items-center justify-center z-[95]">
              <VolumeX size={32} className="text-white" />
            </button>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-950 border-t border-white/5 z-[100]">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="Type a message..." 
              className="flex-1 bg-white/10 rounded-full px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-yellow-500" 
            />
            <button type="submit" className="bg-yellow-500 p-3 rounded-full text-black">
              <Send size={18}/>
            </button>
            <button type="button" onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-white/10 text-white">
              {!isMuted ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </form>
        </div>

        {/* Loader */}
        {status === "Connecting..." && (
          <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950">
            <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
            <p className="text-yellow-500 text-xs font-bold">CONNECTING TO ASTRO...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCallPage;
