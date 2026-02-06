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

  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.current.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setStatus("Live");
      }
    };

    pc.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit("ice-candidate", { to: astroId, candidate: e.candidate });
    };

    socket.on("offer-from-astro", async ({ offer, from }) => {
      try {
        await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.current?.createAnswer();
        await pc.current?.setLocalDescription(answer);
        socket.emit("answer-to-astro", { to: from, answer });
      } catch (err) { console.error(err); }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && pc.current) {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    });

    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("stream-ended", () => navigate(-1));

    socket.emit("join-live-room", { astroId, role: "viewer" });

    return () => {
      socket.off("offer-from-astro");
      socket.off("ice-candidate");
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("stream-ended");
      pc.current?.close();
    };
  }, [astroId, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit("send-message", { roomId: `live_room_${astroId}`, user: "User", text: chatInput });
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-zinc-950 h-[100dvh] w-full fixed inset-0">
      <div className="w-full max-w-[450px] relative bg-black shadow-2xl overflow-hidden flex flex-col">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden">
              <img src="/banners/astrouser.jpg" className="w-full h-full object-cover" alt="astro" />
            </div>
            <div>
              <h3 className="text-white text-sm font-bold">Astro Live</h3>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded font-black text-white animate-pulse">LIVE</span>
                <span className="text-zinc-300 text-[10px] flex items-center gap-1"><Users size={10} /> {viewers}</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="bg-white/10 p-2 rounded-full text-white"><X size={20} /></button>
        </div>

        {/* Video Section */}
        <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" />
          
          <div ref={chatContainerRef} className="absolute bottom-28 left-0 w-full px-4 max-h-[40%] overflow-y-auto z-40 flex flex-col items-start gap-2 scrollbar-hide pointer-events-none">
            {messages.map((m, i) => (
              <div key={i} className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 pointer-events-auto">
                <p className="text-[13px] text-white"><span className="text-yellow-300 font-extrabold mr-1">{m.user}:</span> {m.text}</p>
              </div>
            ))}
          </div>

          {status === "Live" && isMuted && (
            <button onClick={() => setIsMuted(false)} className="absolute inset-0 m-auto w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center z-50 animate-pulse border border-yellow-500/30">
              <VolumeX size={40} className="text-yellow-500" />
            </button>
          )}
        </div>

        {/* Footer Chat Input */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-50 bg-gradient-to-t from-black/90 to-transparent flex gap-3">
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask a question..." className="flex-1 bg-white/10 rounded-full px-5 py-3 text-white text-sm outline-none border border-white/10 focus:border-yellow-500/40" />
            <button type="submit" className="bg-yellow-500 p-3 rounded-full text-black"><Send size={18}/></button>
          </form>
          <button onClick={() => setIsMuted(!isMuted)} className="p-3.5 rounded-full bg-white/10 text-white border border-white/10">
            {!isMuted ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
        </div>

        {status === "Connecting..." && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black">
            <div className="w-10 h-10 border-2 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
            <p className="text-yellow-500 font-bold text-[10px] tracking-widest uppercase">Connecting...</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default LiveCallPage;