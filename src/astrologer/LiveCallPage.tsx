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
  const ROOM_ID = `live_room_${astroId}`;

  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    
    pc.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("Live");
      }
    };

    socket.on("offer-from-astro", async ({ offer, from }) => {
      hostSocketId.current = from;
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages((prev) => [...prev, msg]));

    socket.emit("join-live-room", { astroId, role: "viewer" });

    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("offer-from-astro");
      if (pc.current) pc.current.close();
    };
  }, [astroId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const myMsg = { roomId: ROOM_ID, user: "User", text: chatInput };
    socket.emit("send-message", myMsg);
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-zinc-950 h-[100dvh] w-full fixed inset-0">
      <div className="w-full max-w-[450px] relative bg-black flex flex-col">
        <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-3">
            <h3 className="text-white text-sm font-bold">Astro Live</h3>
            <span className="text-zinc-300 text-[10px] flex items-center gap-1"><Users size={10} /> {viewers}</span>
          </div>
          <button onClick={() => navigate(-1)} className="text-white"><X size={20} /></button>
        </div>
        <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" />
        <div className="absolute bottom-24 left-4 right-4 max-h-40 overflow-y-auto flex flex-col gap-1 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/40 p-1.5 rounded-lg self-start border border-white/10">
              <p className="text-white text-xs"><span className="text-yellow-400 font-bold">{m.user}: </span>{m.text}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="absolute bottom-6 left-4 right-4 flex gap-2">
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-white/20 rounded-full px-4 py-2 text-white text-sm outline-none" placeholder="Chat..." />
          <button type="submit" className="bg-yellow-500 p-2 rounded-full"><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
};
export default LiveCallPage;
