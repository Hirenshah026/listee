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

  const ROOM_ID = `live_room_${astroId}`;

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

    const joinRoom = () => socket.emit("join-live-room", { astroId, role: "viewer" });
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

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
        alert("Session Ended");
        navigate(-1);
    });

    return () => { 
        socket.off("update-viewers"); 
        socket.off("receive-message"); 
        socket.off("stream-ended");
        pc.current?.close(); 
    };
  }, [astroId, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const msgId = `m-${Date.now()}`;
    const msgData = { roomId: ROOM_ID, user: "User", text: chatInput, id: msgId };
    
    // Fix: Show message immediately on viewer screen
    setMessages(prev => [...prev, msgData]);
    messageIds.current.add(msgId);

    socket.emit("send-message", msgData);
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-black h-screen w-full fixed inset-0 overflow-hidden">
      <div className="w-full max-w-[450px] relative bg-zinc-950 flex flex-col h-full shadow-2xl">
        
        {/* Loader Overlay */}
        {status === "Connecting..." && (
            <div className="absolute inset-0 bg-black z-[60] flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-yellow-500 text-xs font-bold tracking-widest">CONNECTING...</p>
            </div>
        )}

        {/* Header */}
        <div className="absolute top-0 w-full p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2 text-white">
            <div className="w-10 h-10 rounded-full border border-yellow-500 overflow-hidden"><img src="/banners/astrouser.jpg" className="w-full h-full object-cover" alt="Astro" /></div>
            <div className="text-xs font-bold">Astro Live <br/> <span className="flex items-center gap-1 text-[10px] text-zinc-300"><Users size={10}/> {viewers}</span></div>
          </div>
          <button onClick={() => navigate(-1)} className="text-white bg-white/10 p-2 rounded-full"><X size={18}/></button>
        </div>

        <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="flex-1 object-cover bg-black" />
        
        <div ref={chatContainerRef} className="absolute bottom-24 w-full px-4 max-h-[160px] overflow-y-auto flex flex-col gap-1.5 scrollbar-hide z-40">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/50 backdrop-blur-sm text-white text-xs p-2 rounded-xl self-start border border-white/5">
              <span className="font-bold text-yellow-400 mr-1">{m.user}:</span>{m.text}
            </div>
          ))}
        </div>

        <div className="p-4 flex gap-2 bg-black border-t border-white/5 z-50">
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-white/10 rounded-full px-4 text-white text-xs py-2.5 outline-none border border-white/10" placeholder="Chat..." />
            <button className="bg-yellow-500 p-2.5 rounded-full text-black"><Send size={16}/></button>
          </form>
          <button onClick={() => setIsMuted(!isMuted)} className="text-white p-2">{isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}</button>
        </div>
      </div>
    </div>
  );
};
export default LiveCallPage;
