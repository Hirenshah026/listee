import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { X, Send, Users } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!astroId) return;
    
    // Step 1: Initialize PC
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    pc.current.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setLoading(false);
      }
    };

    pc.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit("ice-candidate", { to: astroId, candidate: e.candidate });
    };

    // Step 2: Join Room
    socket.emit("join-live-room", { astroId, role: "viewer" });

    // Step 3: Signaling Listeners
    socket.on("offer-from-astro", async ({ offer, from }) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("ice-candidate", ({ candidate }) => {
      pc.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
    });

    socket.on("update-viewers", (count) => setViewers(count));
    
    socket.on("receive-message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("stream-ended", () => navigate(-1));

    return () => {
      socket.off("offer-from-astro");
      socket.off("ice-candidate");
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("stream-ended");
      pc.current?.close();
    };
  }, [astroId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    // Backend expects 'roomId' for broadcasting
    socket.emit("send-message", { 
      roomId: `live_room_${astroId}`, 
      user: "User", 
      text: chatInput, 
      id: Date.now() 
    });
    setChatInput("");
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans">
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-white bg-black/40 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-bold">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          <Users size={12}/> {viewers} VIEWERS
        </div>
        <button onClick={() => navigate(-1)} className="text-white bg-white/20 p-2 rounded-full backdrop-blur-md"><X size={20}/></button>
      </div>

      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-yellow-500 text-[10px] font-bold tracking-widest">CONNECTING TO LIVE...</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black to-transparent flex flex-col gap-3">
        <div className="max-h-[140px] overflow-y-auto flex flex-col gap-2 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/50 backdrop-blur-sm p-2 rounded-xl text-white text-[11px] self-start border border-white/5">
              <span className="text-yellow-400 font-bold">{m.user}: </span>{m.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 mb-2">
          <input 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            className="flex-1 bg-white/10 backdrop-blur-md rounded-full px-5 py-3 text-white text-xs outline-none border border-white/10" 
            placeholder="Type your message..." 
          />
          <button className="bg-yellow-500 p-3 rounded-full text-black shadow-lg shadow-yellow-500/20 active:scale-90 transition-all"><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
};
export default LiveCallPage;
