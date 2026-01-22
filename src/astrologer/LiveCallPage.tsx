import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { X, Volume2, VolumeX, Users, Send } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const hostSocketId = useRef<string | null>(null);
  
  const isSettingRemoteDescription = useRef(false);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef(new Set());

  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("Live");
      }
    };

    // --- Join Logic ---
    const joinRoom = () => {
      socket.emit("join-live-room", { astroId, role: "viewer" });
    };

    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    socket.on("update-viewers", (count) => setViewers(count));
    
    socket.on("receive-message", (msg) => {
      if (!messageIds.current.has(msg.id)) {
        messageIds.current.add(msg.id);
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("offer-from-astro", async ({ offer, from }) => {
      if (!pc.current) return;
      hostSocketId.current = from;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("stream-ended", () => navigate(-1));

    return () => {
      socket.off("connect", joinRoom);
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

    const myMsg = { 
      roomId: `live_room_${astroId}`, // Isse Host aur Viewer dono ko milega
      user: "User", 
      text: chatInput, 
      id: `${socket.id}-${Date.now()}` 
    };

    // Optimistic Update (For Viewer)
    setMessages((prev) => [...prev, myMsg]);
    messageIds.current.add(myMsg.id);

    socket.emit("send-message", myMsg);
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-zinc-950 h-[100dvh] w-full fixed inset-0 font-sans">
      <div className="w-full max-w-[450px] relative bg-black shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Overlay (Purana Wala) */}
        <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-start bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden bg-zinc-800">
              <img src="/banners/astrouser.jpg" alt="Astro" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-white text-sm font-bold flex items-center gap-1">Astro Live</h3>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded font-black text-white animate-pulse">LIVE</span>
                <span className="text-zinc-300 text-[10px] flex items-center gap-1"><Users size={10} /> {viewers}</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="bg-white/10 p-2 rounded-full text-white"><X size={20} /></button>
        </div>

        {/* Video Screen */}
        <div className="flex-1 relative flex items-center justify-center bg-zinc-900">
          <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" />
          
          {/* Chat Messages (Purana Style) */}
          <div 
            ref={chatContainerRef}
            className="absolute bottom-28 left-0 w-full px-4 max-h-40 overflow-y-auto z-40 flex flex-col gap-1 scrollbar-hide"
          >
            {messages.map((m, i) => (
              <div key={i} className="flex items-start">
                <div className="text-white text-xs bg-black/40 p-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                  <span className="font-bold text-yellow-400">{m.user}: </span>{m.text}
                </div>
              </div>
            ))}
          </div>

          {status === "Live" && isMuted && (
            <button onClick={() => setIsMuted(false)} className="absolute inset-0 m-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center z-50">
              <VolumeX size={32} className="text-yellow-500" />
            </button>
          )}
        </div>

        {/* Input Area (Purana Style) */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-50 bg-gradient-to-t from-black/80 to-transparent flex gap-3 items-center">
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="Chat with Astro..." 
              className="flex-1 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm outline-none border border-white/10" 
            />
            <button type="submit" className="bg-yellow-500 p-2 rounded-full text-black"><Send size={18}/></button>
          </form>
          <button onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-white/10 text-white">
            {!isMuted ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>

        {/* Loader Overlay */}
        {status === "Connecting..." && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-zinc-950/90">
            <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
            <p className="text-yellow-500 font-bold tracking-widest text-xs">CONNECTING TO LIVE...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCallPage;
