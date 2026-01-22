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

  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  const ROOM_ID = `live_room_${astroId}`;

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // 1. WebRTC Setup - LAPTOP COMPATIBILITY FIX
    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
      ]
    });

    pc.current.ontrack = (event) => {
      console.log("Track received from Astro");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("Live");
      }
    };

    // ICE Candidate exchange fix
    pc.current.onicecandidate = (e) => {
      if (e.candidate && hostSocketId.current) {
        socket.emit("ice-candidate", { to: hostSocketId.current, candidate: e.candidate });
      }
    };

    // 2. Socket Listeners
    socket.on("offer-from-astro", async ({ offer, from }) => {
      console.log("Offer received from laptop/host");
      hostSocketId.current = from;
      
      try {
        if (pc.current) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          socket.emit("answer-to-astro", { to: from, answer });
        }
      } catch (err) {
        console.error("Error during WebRTC handshake:", err);
      }
    });

    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages((prev) => [...prev, msg]));

    socket.on("ice-candidate", async (data) => {
      if (data.candidate && pc.current) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Error adding ice candidate", e);
        }
      }
    });

    socket.on("stream-ended", () => {
      navigate(-1);
    });

    // 3. Join Room
    socket.emit("join-live-room", { astroId, role: "viewer" });

    // 4. Cleanup
    return () => {
      socket.off("offer-from-astro");
      socket.off("update-viewers");
      socket.off("receive-message");
      socket.off("ice-candidate");
      socket.off("stream-ended");
      if (pc.current) {
        pc.current.close();
        pc.current = null;
      }
    };
  }, [astroId, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const myMsg = { 
      roomId: ROOM_ID, 
      user: "User", 
      text: chatInput, 
      id: Date.now() 
    };

    socket.emit("send-message", myMsg);
    setChatInput("");
  };

  return (
    <div className="flex justify-center bg-zinc-950 h-[100dvh] w-full fixed inset-0 font-sans">
      <div className="w-full max-w-[450px] relative bg-black shadow-2xl overflow-hidden flex flex-col border-x border-white/5">
        
        {/* Header Section */}
        <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden bg-zinc-800">
              <img src="/banners/astrouser.jpg" alt="Astro" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-white text-sm font-bold">Astro Live</h3>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded font-black text-white animate-pulse uppercase">LIVE</span>
                <span className="text-zinc-300 text-[10px] flex items-center gap-1 font-medium"><Users size={10} className="text-yellow-500" /> {viewers}</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="bg-white/10 p-2 rounded-full text-white active:scale-95 transition-transform"><X size={20} /></button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative flex items-center justify-center bg-zinc-900">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            muted={isMuted} 
            className="w-full h-full object-cover" 
          />
          
          {/* Chat Messages Fixed Style */}
          <div ref={chatContainerRef} className="absolute bottom-28 left-0 w-full px-4 max-h-[40%] overflow-y-auto z-40 flex flex-col items-start gap-2 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 inline-block">
                <p className="text-[13px] leading-snug">
                  <span className="text-yellow-300 font-extrabold mr-1.5 brightness-110">{m.user}:</span>
                  <span className="text-white">{m.text}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Unmute Overlay */}
          {status === "Live" && isMuted && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <button onClick={() => setIsMuted(false)} className="bg-yellow-500/20 p-6 rounded-full border border-yellow-500/30 animate-pulse group">
                <VolumeX size={40} className="text-yellow-500 group-active:scale-90 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-50 bg-gradient-to-t from-black/90 to-transparent flex gap-3 items-center">
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="Ask a question..." 
              className="flex-1 bg-white/10 backdrop-blur-xl rounded-full px-5 py-3 text-white text-sm outline-none border border-white/10 focus:border-yellow-500/40" 
            />
            <button type="submit" className="bg-yellow-500 p-3 rounded-full text-black active:scale-90 transition-transform"><Send size={18}/></button>
          </form>
          <button onClick={() => setIsMuted(!isMuted)} className="p-3.5 rounded-full bg-white/10 text-white backdrop-blur-md active:scale-95 transition-transform border border-white/10">
            {!isMuted ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
        </div>

        {/* Connection Status */}
        {status === "Connecting..." && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black">
            <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
            <p className="text-yellow-500 font-bold text-[10px] uppercase tracking-[0.2em]">Connecting to Astro...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCallPage;
