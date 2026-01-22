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
  const [hostSocketId, setHostSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (!astroId) return;

    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.current.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.current.onicecandidate = (e) => {
      if (e.candidate && hostSocketId) {
        socket.emit("ice-candidate", { to: hostSocketId, candidate: e.candidate });
      }
    };

    socket.emit("join-live-room", { astroId, role: "viewer" });

    socket.on("offer-from-astro", async ({ offer, from }) => {
      setHostSocketId(from); 
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("ice-candidate", ({ candidate }) => {
      pc.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    });

    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages(prev => [...prev, msg]));
    socket.on("stream-ended", () => navigate(-1));

    return () => {
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("offer-from-astro");
      socket.off("ice-candidate");
      pc.current?.close();
    };
  }, [astroId, hostSocketId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit("send-message", { 
      roomId: `live_room_${astroId}`, 
      user: "User", 
      text: chatInput, 
      id: Date.now() 
    });
    setChatInput("");
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-white text-xs font-bold flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <Users size={12}/> {viewers}
        </div>
        <button onClick={() => navigate(-1)} className="text-white bg-white/20 p-2 rounded-full backdrop-blur-md"><X size={20}/></button>
      </div>

      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-zinc-950" />

      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black flex flex-col gap-3">
        <div className="max-h-[140px] overflow-y-auto flex flex-col gap-2 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/50 p-2 rounded-lg text-white text-[11px] self-start border border-white/5">
              <span className="text-yellow-400 font-bold">{m.user}: </span>{m.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 mb-2 items-center">
          <input 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            className="flex-1 bg-white/10 backdrop-blur-md rounded-full px-5 py-3 text-white text-xs outline-none border border-white/10" 
            placeholder="Chat with astro..." 
          />
          <button className="bg-yellow-500 p-3 rounded-full text-black shadow-lg"><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
};
export default LiveCallPage;
