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

    // --- YE LINE USER KO WAPAS BHEJEGI ---
    socket.on("stream-ended", () => {
        alert("Astro has ended the live session.");
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
    
    const msgData = { 
        roomId: ROOM_ID, 
        user: "User", 
        text: chatInput, 
        id: `m-${socket.id}-${Date.now()}` 
    };
    
    // Sirf emit karo, backend ise receive-message mein wapas bhejega
    socket.emit("send-message", msgData);
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-black h-screen w-full fixed inset-0 font-sans overflow-hidden">
      <div className="w-full max-w-[450px] relative bg-zinc-900 flex flex-col h-full">
        {/* Header */}
        <div className="absolute top-0 w-full p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border border-yellow-500 overflow-hidden"><img src="/banners/astrouser.jpg" className="w-full h-full object-cover" /></div>
            <div className="text-white text-[11px] font-bold">Astro Live <br/> <span className="flex items-center gap-1 text-[9px] text-zinc-300 font-normal"><Users size={10}/> {viewers} Viewers</span></div>
          </div>
          <button onClick={() => navigate(-1)} className="text-white bg-white/10 p-2 rounded-full"><X size={18}/></button>
        </div>

        {/* Video Area */}
        <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="flex-1 bg-black object-cover" />
        
        {/* Chat Area */}
        <div ref={chatContainerRef} className="absolute bottom-24 w-full px-4 max-h-[160px] overflow-y-auto flex flex-col gap-1.5 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-sm text-white text-[12px] p-2 rounded-lg border border-white/10 self-start">
              <span className="font-bold text-yellow-400">{m.user}: </span>{m.text}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 flex gap-2 bg-black border-t border-white/5">
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-white/10 rounded-full px-4 text-white text-xs py-2.5 outline-none" placeholder="Chat with Astro..." />
            <button className="bg-yellow-500 p-2.5 rounded-full text-black"><Send size={16}/></button>
          </form>
          <button onClick={() => setIsMuted(!isMuted)} className="text-white p-2">{isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}</button>
        </div>
      </div>
    </div>
  );
};
export default LiveCallPage;
