import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { X, VolumeX, Users, Send, Volume2 } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  
  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    // 1. Initialize Peer Connection
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.current.ontrack = (event) => {
      console.log("Track received");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("Live");
      }
    };

    pc.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { to: astroId, candidate: e.candidate });
      }
    };

    // 2. Signaling Listeners
    socket.on("offer-from-host", async ({ offer, from }) => {
      console.log("Offer received from host");
      try {
        await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.current?.createAnswer();
        await pc.current?.setLocalDescription(answer);
        socket.emit("answer-to-host", { to: from, answer });
      } catch (err) { console.error("WebRTC Error:", err); }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && pc.current) {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    });

    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("stream-ended", () => {
      alert("Host has ended the live session.");
      navigate(-1);
    });

    // 3. Join Room
    socket.emit("join-live-room", { astroId, role: "viewer" });

    return () => {
      socket.off("offer-from-host");
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
    socket.emit("send-message", { astroId: astroId, user: "User", text: chatInput });
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-black h-[100dvh] w-full fixed inset-0">
      <div className="w-full max-w-[450px] relative overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded font-bold text-white animate-pulse">LIVE</span>
            <span className="text-white text-xs flex items-center gap-1"><Users size={12} /> {viewers}</span>
          </div>
          <button onClick={() => navigate(-1)} className="bg-white/10 p-2 rounded-full text-white"><X size={20} /></button>
        </div>

        {/* Video Screen */}
        <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" />
          
          {status === "Connecting..." && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div className="w-8 h-8 border-2 border-t-yellow-500 rounded-full animate-spin mb-2"></div>
              <p className="text-yellow-500 text-xs font-medium uppercase tracking-widest">Waiting for Host...</p>
            </div>
          )}

          {status === "Live" && isMuted && (
            <button onClick={() => setIsMuted(false)} className="absolute inset-0 m-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center z-30 animate-pulse border border-yellow-500/40">
              <VolumeX size={32} className="text-yellow-500" />
            </button>
          )}

          {/* Chat Messages */}
          <div className="absolute bottom-20 left-0 w-full px-4 max-h-[35%] overflow-y-auto flex flex-col gap-2 z-10">
            {messages.map((m, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/5 self-start">
                <p className="text-[13px] text-zinc-100 font-medium">
                  <span className="text-yellow-400 font-bold mr-1.5">{m.user}:</span>{m.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-black flex gap-2 items-center">
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
            <input 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="Type your question..." 
              className="flex-1 bg-zinc-800 rounded-full px-4 py-2.5 text-white text-sm outline-none border border-white/5 focus:border-yellow-500/50" 
            />
            <button type="submit" className="bg-yellow-500 p-2.5 rounded-full text-black"><Send size={18} /></button>
          </form>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 bg-zinc-800 rounded-full text-white">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveCallPage;