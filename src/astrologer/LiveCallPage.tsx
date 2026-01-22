import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { X, Send, Users, Heart } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [hostSocketId, setHostSocketId] = useState<string | null>(null);

  const ROOM_ID = `live_room_${astroId}`;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!astroId) return;
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.current.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
    pc.current.onicecandidate = (e) => {
      if (e.candidate && hostSocketId) socket.emit("ice-candidate", { to: hostSocketId, candidate: e.candidate });
    };

    socket.emit("join-live-room", { astroId, role: "viewer" });
    socket.on("offer-from-astro", async ({ offer, from }) => {
      setHostSocketId(from);
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });
    socket.on("ice-candidate", ({ candidate }) => { pc.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {}); });
    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages(prev => [...prev, msg]));
    socket.on("stream-ended", () => navigate(-1));

    return () => { socket.off("receive-message"); socket.off("update-viewers"); pc.current?.close(); };
  }, [astroId, hostSocketId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit("send-message", { roomId: ROOM_ID, user: "You", text: chatInput, id: Date.now() });
    setChatInput("");
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Top Header Overlay */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-start z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden"><img src="/banners/astrouser.jpg" className="w-full h-full object-cover" /></div>
          <div>
            <p className="text-white text-xs font-bold">Astro Session</p>
            <div className="flex items-center gap-2"><span className="text-[10px] text-white flex items-center gap-1 bg-red-600 px-2 rounded-full uppercase font-bold"><Users size={10}/> {viewers}</span></div>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="bg-white/10 p-2 rounded-full text-white backdrop-blur-md"><X/></button>
      </div>

      {/* Video Content */}
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

      {/* Bottom Overlay Area */}
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-4">
        {/* Chat List */}
        <div className="max-h-[180px] overflow-y-auto flex flex-col gap-2 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md p-2 px-3 rounded-2xl self-start max-w-[80%] border border-white/5">
              <p className="text-white text-xs"><span className="text-yellow-400 font-bold mr-1">{m.user}:</span> {m.text}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Field */}
        <div className="flex gap-2 items-center">
          <form onSubmit={sendMessage} className="flex-1 flex gap-2">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)} 
              className="flex-1 bg-white/20 backdrop-blur-xl rounded-full px-5 py-3 text-white text-sm outline-none border border-white/10 placeholder:text-white/40" 
              placeholder="Type your message..." 
            />
            <button type="submit" className="bg-yellow-500 p-3.5 rounded-full text-black shadow-lg active:scale-90 transition-all"><Send size={20}/></button>
          </form>
          <button className="bg-pink-600 p-3.5 rounded-full text-white animate-bounce shadow-lg"><Heart size={20}/></button>
        </div>
      </div>
    </div>
  );
};
export default LiveCallPage;
