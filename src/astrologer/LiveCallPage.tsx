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
  const ROOM_ID = `live_room_${astroId}`;

  useEffect(() => {
    if (!astroId) return;
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    // Track receive logic (VIDEO FIX)
    pc.current.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    // ICE Candidate send logic (VIDEO FIX)
    pc.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { to: astroId, candidate: e.candidate });
      }
    };

    socket.emit("join-live-room", { astroId, role: "viewer" });

    socket.on("offer-from-astro", async ({ offer, from }) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("ice-candidate", ({ candidate }) => {
      pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages(prev => [...prev, msg]));
    socket.on("stream-ended", () => navigate(-1));

    return () => {
      socket.off("offer-from-astro");
      socket.off("ice-candidate");
      socket.off("update-viewers");
      socket.off("receive-message");
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
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/70 to-transparent">
        <div className="text-white text-xs font-bold flex items-center gap-2">
          <Users size={14}/> {viewers}
        </div>
        <button onClick={() => navigate(-1)} className="text-white bg-white/20 p-2 rounded-full"><X/></button>
      </div>
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-zinc-900" />
      
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
        <div className="max-h-[120px] overflow-y-auto mb-4 flex flex-col gap-2 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/40 p-2 rounded-lg text-white text-[11px] self-start">
              <span className="text-yellow-400 font-bold">{m.user}: </span>{m.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white text-xs outline-none" placeholder="Chat..." />
          <button className="bg-yellow-500 p-2 rounded-full"><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
};
export default LiveCallPage;
