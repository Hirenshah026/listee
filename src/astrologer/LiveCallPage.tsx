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
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [status, setStatus] = useState("Connecting...");

  const ROOM_NAME = `live_room_${astroId}`;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!astroId) return;

    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.current.ontrack = (e) => { 
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      setStatus("Live");
    };

    const join = () => socket.emit("join-live-room", { astroId, role: "viewer" });
    if (socket.connected) join();
    socket.on("connect", join);

    socket.on("offer-from-astro", async ({ offer, from }) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => {
      if (!messageIds.current.has(msg.id)) {
        messageIds.current.add(msg.id);
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on("stream-ended", () => {
      alert("Astro has ended the stream.");
      navigate(-1);
    });

    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("stream-ended");
      if (pc.current) pc.current.close();
    };
  }, [astroId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msgId = `m-${Date.now()}`;
    const msgData = { roomId: ROOM_NAME, user: "User", text: chatInput, id: msgId };
    
    // Optimistic Update
    setMessages(prev => [...prev, msgData]);
    messageIds.current.add(msgId);
    
    socket.emit("send-message", msgData);
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-black h-[100dvh] w-full fixed inset-0 overflow-hidden font-sans">
      <div className="w-full max-w-[450px] relative bg-black flex flex-col h-full">
        
        {/* Loading State */}
        {status === "Connecting..." && (
          <div className="absolute inset-0 bg-black z-[100] flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-yellow-500 text-xs font-bold tracking-[0.2em]">CONNECTING LIVE...</p>
          </div>
        )}

        {/* Header Overlay */}
        <div className="absolute top-0 w-full p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden shadow-lg">
              <img src="/banners/astrouser.jpg" className="w-full h-full object-cover" alt="Astro" />
            </div>
            <div>
              <h3 className="text-white text-xs font-bold">Astro Session</h3>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-[8px] px-1.5 py-0.5 rounded font-black text-white">LIVE</span>
                <span className="text-white text-[10px] flex items-center gap-1 font-bold"><Users size={10} /> {viewers}</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"><X size={20} /></button>
        </div>

        {/* Video Area */}
        <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="flex-1 object-cover bg-zinc-900" />
        
        {/* Chat Overlay */}
        <div ref={chatContainerRef} className="absolute bottom-24 w-full px-4 max-h-[160px] overflow-y-auto z-40 flex flex-col gap-1.5 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/50 backdrop-blur-md border border-white/5 px-3 py-2 rounded-2xl text-white text-xs self-start max-w-[85%]">
              <span className="font-bold text-yellow-400 mr-1">{m.user}:</span>{m.text}
            </div>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-black/90 border-t border-white/5 flex gap-3 items-center z-50">
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
            <input 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="Type a message..." 
              className="flex-1 bg-white/10 rounded-full px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-yellow-500/50 transition-all" 
            />
            <button type="submit" className="bg-yellow-500 p-3 rounded-full text-black hover:scale-105 active:scale-95 transition-transform"><Send size={18}/></button>
          </form>
          <button onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-white/10 text-white transition-colors">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveCallPage;
