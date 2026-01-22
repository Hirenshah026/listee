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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef(new Set());

  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    pc.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("Live");
      }
    };

    pc.current.onicecandidate = (e) => {
      if (e.candidate && hostSocketId.current) {
        socket.emit("ice-candidate", { to: hostSocketId.current, candidate: e.candidate });
      }
    };

    const joinRoom = () => {
      socket.emit("join-live-room", { astroId, role: "viewer" });
    };

    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    socket.on("offer-from-astro", async ({ offer, from }) => {
      hostSocketId.current = from;
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("ice-candidate", async (data) => {
      if (pc.current && data.candidate) await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    socket.on("update-viewers", (count) => {
      console.log("Viewer Side Count:", count);
      setViewers(count);
    });
    
    socket.on("receive-message", (msg) => {
      if (!messageIds.current.has(msg.id)) {
        messageIds.current.add(msg.id);
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("stream-ended", () => navigate(-1));

    return () => {
      socket.off("connect", joinRoom);
      socket.off("offer-from-astro");
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("ice-candidate");
      socket.off("stream-ended");
      if (pc.current) pc.current.close();
    };
  }, [astroId, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msgId = `msg-${Date.now()}`;
    const myMsg = { 
      roomId: `live_room_${astroId}`, 
      user: "User", 
      text: chatInput, 
      id: msgId 
    };

    // Optimistic UI Update
    setMessages((prev) => [...prev, myMsg]);
    messageIds.current.add(msgId);

    socket.emit("send-message", myMsg);
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-black h-[100dvh] w-full fixed inset-0 overflow-hidden font-sans">
      <div className="w-full max-w-[450px] relative bg-zinc-900 flex flex-col h-full overflow-hidden shadow-2xl">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-yellow-500 overflow-hidden"><img src="/banners/astrouser.jpg" className="w-full h-full object-cover" alt="Astro" /></div>
            <div>
              <h3 className="text-white text-xs font-bold uppercase tracking-tight">Astro Live</h3>
              <div className="flex items-center gap-2"><span className="bg-red-600 text-[9px] px-1.5 py-0.5 rounded font-black text-white">LIVE</span><span className="text-white text-[10px] flex items-center gap-1 font-bold"><Users size={10} /> {viewers}</span></div>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="bg-white/10 p-2 rounded-full text-white"><X size={18} /></button>
        </div>

        {/* Video Screen */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" />
          
          {/* Chat Messages */}
          <div ref={chatContainerRef} className="absolute bottom-24 left-0 w-full px-4 max-h-[160px] overflow-y-auto z-40 flex flex-col gap-1.5 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={m.id || i} className="flex flex-col items-start">
                <div className="bg-black/40 backdrop-blur-sm border border-white/5 px-3 py-1.5 rounded-xl text-white text-xs max-w-[85%]">
                  <span className="font-bold text-yellow-400 mr-1">{m.user}:</span>{m.text}
                </div>
              </div>
            ))}
          </div>

          {status === "Live" && isMuted && (
            <button onClick={() => setIsMuted(false)} className="absolute inset-0 m-auto w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center z-50"><VolumeX size={28} className="text-yellow-500" /></button>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-gradient-to-t from-black to-transparent flex gap-2 items-center z-50">
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Say hi..." className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-white text-xs border border-white/10 outline-none focus:border-yellow-500" />
            <button type="submit" className="bg-yellow-500 p-2.5 rounded-full text-black"><Send size={16}/></button>
          </form>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 rounded-full bg-white/10 text-white">{!isMuted ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        </div>

        {status === "Connecting..." && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black">
            <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-3"></div>
            <p className="text-yellow-500 font-bold text-[10px] tracking-widest">JOINING STREAM...</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default LiveCallPage;
