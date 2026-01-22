import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { X, Send } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [astroSocketId, setAstroSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (!astroId) return;

    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    pc.current.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.current.onicecandidate = (e) => {
      if (e.candidate && astroSocketId) {
        // ID ki jagah host ki socket ID pe bhej rahe hain
        socket.emit("ice-candidate", { to: astroSocketId, candidate: e.candidate });
      }
    };

    socket.emit("join-live-room", { astroId, role: "viewer" });

    socket.on("offer-from-astro", async ({ offer, from }) => {
      setAstroSocketId(from); // Host ki Socket ID save karli
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("ice-candidate", ({ candidate }) => {
      pc.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    });

    socket.on("receive-message", (msg) => setMessages(p => [...p, msg]));
    socket.on("stream-ended", () => navigate(-1));

    return () => {
      socket.off("offer-from-astro");
      socket.off("ice-candidate");
      socket.off("receive-message");
      pc.current?.close();
    };
  }, [astroId, astroSocketId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit("send-message", { roomId: `live_room_${astroId}`, user: "User", text: chatInput, id: Date.now() });
    setChatInput("");
  };

  return (
    <div className="fixed inset-0 bg-black">
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <button onClick={() => navigate(-1)} className="absolute top-4 right-4 text-white z-50"><X/></button>
      
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black flex flex-col gap-3">
        <div className="max-h-[120px] overflow-y-auto flex flex-col gap-1">
          {messages.map((m, i) => (
            <div key={i} className="text-white text-xs bg-black/20 p-1 rounded">
              <span className="text-yellow-400 font-bold">{m.user}: </span>{m.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white outline-none" placeholder="Chat..." />
          <button className="bg-yellow-500 p-2 rounded-full"><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
};
export default LiveCallPage;
