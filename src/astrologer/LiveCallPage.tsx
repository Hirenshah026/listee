import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { Send, X, Users } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    // Join logic
    socket.emit("join-live-room", { astroId, role: "viewer" });

    socket.on("update-viewers", (count) => setViewers(count));
    
    socket.on("receive-message", (msg) => {
      console.log("LOG: Viewer Received Message ->", msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("offer-from-astro", async ({ offer, from }) => {
      console.log("LOG: Offer Received from Astro");
      pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      
      pc.current.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };

      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("offer-from-astro");
    };
  }, [astroId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;
    const msg = { roomId: `live_room_${astroId}`, user: "User", text: chatInput, id: Date.now() };
    socket.emit("send-message", msg);
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-black h-screen w-full fixed inset-0">
      <div className="w-full max-w-[450px] relative flex flex-col h-full bg-zinc-900 shadow-2xl overflow-hidden">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        
        {/* Header */}
        <div className="absolute top-0 p-4 w-full flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <div className="text-white">
            <p className="text-[10px] font-bold text-red-500 animate-pulse">LIVE</p>
            <p className="text-xs flex items-center gap-1"><Users size={12}/> {viewers}</p>
          </div>
          <button onClick={() => navigate(-1)} className="text-white p-2 bg-white/10 rounded-full"><X size={20}/></button>
        </div>

        {/* Chat */}
        <div className="absolute bottom-24 left-0 w-full px-4 max-h-[200px] overflow-y-auto flex flex-col gap-2">
          {messages.map((m, i) => (
            <div key={i} className="text-white text-xs bg-black/50 p-2 rounded-lg border border-white/5 backdrop-blur-sm self-start">
              <span className="text-yellow-500 font-bold">{m.user}:</span> {m.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="absolute bottom-0 w-full p-4 bg-black/60 backdrop-blur-lg flex gap-2">
          <form onSubmit={sendMessage} className="flex-1 flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white text-sm outline-none border border-white/20" placeholder="Chat..." />
            <button type="submit" className="bg-yellow-500 p-2 rounded-full"><Send size={18}/></button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default LiveCallPage;
