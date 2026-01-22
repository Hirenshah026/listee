import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { X, Send, Users } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const messageIds = useRef(new Set());

  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const ROOM_ID = `live_room_${astroId}`;

  useEffect(() => {
    if (!astroId) return;

    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    
    pc.current.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setIsConnected(true);
      }
    };

    socket.emit("join-live-room", { astroId, role: "viewer" });

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

    socket.on("stream-ended", () => navigate(-1));

    return () => {
      socket.off("receive-message");
      socket.off("stream-ended");
      pc.current?.close();
    };
  }, [astroId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = { roomId: ROOM_ID, user: "User", text: chatInput, id: `m-${Date.now()}` };
    socket.emit("send-message", msg);
    setChatInput("");
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/70 to-transparent">
        <div className="text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-yellow-500 overflow-hidden">
            <img src="/banners/astrouser.jpg" className="object-cover w-full h-full" />
          </div>
          <span className="text-xs font-bold font-sans">Live • <Users size={12} className="inline mr-1"/>{viewers}</span>
        </div>
        <button onClick={() => navigate(-1)} className="text-white bg-white/20 p-2 rounded-full"><X/></button>
      </div>

      {/* Video */}
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-yellow-500 animate-pulse text-xs font-bold tracking-widest">CONNECTING TO ASTRO...</p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="absolute bottom-24 left-0 w-full px-4 max-h-[150px] overflow-y-auto flex flex-col gap-2 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className="bg-black/40 backdrop-blur-sm p-2 rounded-lg self-start">
            <p className="text-white text-xs"><span className="text-yellow-400 font-bold">{m.user}:</span> {m.text}</p>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="absolute bottom-0 w-full p-4 bg-black/60 border-t border-white/5 flex gap-2 items-center">
        <form onSubmit={sendMessage} className="flex-1 flex gap-2">
          <input 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white text-xs outline-none" 
            placeholder="Type message..." 
          />
          <button className="bg-yellow-500 p-2 rounded-full text-black"><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
};
export default LiveCallPage;
