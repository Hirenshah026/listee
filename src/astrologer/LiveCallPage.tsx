import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { X, Volume2, VolumeX, Users, Star } from "lucide-react"; // Icons ke liye lucide-react use karein

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const hostSocketId = useRef<string | null>(null);
  
  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");

  // Exit Function
  const handleExit = () => {
    if (window.confirm("Bhai, kya aap live stream band karna chahte hain?")) {
      if (pc.current) pc.current.close();
      navigate(-1); // Pichle page par wapas
    }
  };

  useEffect(() => {
    if (!pc.current) {
      pc.current = new RTCPeerConnection({ 
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }] 
      });
    }

    pc.current.ontrack = (event) => {
      console.log("🔥 SUCCESS: Stream received!");
      if (remoteVideoRef.current) {
        if (remoteVideoRef.current.srcObject !== event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setStatus("Live");
        }
      }
    };

    pc.current.onicecandidate = (e) => {
      if (e.candidate && hostSocketId.current) {
        socket.emit("ice-candidate", { to: hostSocketId.current, candidate: e.candidate });
      }
    };

    const joinRoom = () => {
      if (status !== "Live") {
        socket.emit("join-live-room", { astroId });
      }
    };

    const interval = setInterval(() => {
      if (status === "Live") clearInterval(interval);
      else joinRoom();
    }, 3000);

    joinRoom();

    socket.on("offer-from-astro", async ({ offer, from }) => {
      hostSocketId.current = from;
      if (pc.current) {
        await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);
        socket.emit("answer-to-astro", { to: from, answer });
      }
    });

    socket.on("ice-candidate", async (data) => {
      if (data.candidate && pc.current) {
        await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
      }
    });

    return () => {
      clearInterval(interval);
      socket.off("offer-from-astro");
      socket.off("ice-candidate");
    };
  }, [astroId, status]);

  return (
    <div className="flex justify-center bg-zinc-950 h-[100dvh] w-full fixed inset-0 font-sans">
      <div className="w-full max-w-[450px] relative bg-black shadow-2xl overflow-hidden flex flex-col">
        
        {/* TOP OVERLAY: Info & Close */}
        <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-start bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden bg-zinc-800">
                <img src="/api/placeholder/40/40" alt="Astro" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-black"></div>
            </div>
            <div>
              <h3 className="text-white text-sm font-bold flex items-center gap-1">
                Astro Live <Star size={12} className="fill-yellow-500 text-yellow-500" />
              </h3>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded font-black text-white animate-pulse">LIVE</span>
                <span className="text-zinc-300 text-[10px] flex items-center gap-1">
                  <Users size={10} /> 1.2k
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleExit}
            className="bg-white/10 hover:bg-red-600/80 p-2 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* MAIN VIDEO */}
        <div className="flex-1 relative flex items-center justify-center bg-zinc-900">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            muted={isMuted}
            className="w-full h-full object-cover"
          />
          
          {/* Unmute Big Button (Overlay) */}
          {status === "Live" && isMuted && (
            <button 
              onClick={() => setIsMuted(false)}
              className="absolute inset-0 m-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/50 backdrop-blur-sm animate-pulse"
            >
              <VolumeX size={32} className="text-yellow-500" />
            </button>
          )}
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-50 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
          <div className="flex-1 mr-4">
             <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 flex items-center">
                <input 
                  type="text" 
                  placeholder="Say Hi to Astro..." 
                  className="bg-transparent border-none outline-none text-white text-sm w-full"
                />
             </div>
          </div>
          
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full transition-all ${!isMuted ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white border border-white/20'}`}
          >
            {!isMuted ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>

        {/* LOADING STATE */}
        {status === "Connecting..." && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-zinc-950/90 text-white">
            <div className="relative">
               <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
               <Star className="absolute inset-0 m-auto text-yellow-500 animate-pulse" size={20} />
            </div>
            <p className="mt-4 font-bold text-yellow-500">Connecting to Astro...</p>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Seeking Divine Guidance</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCallPage;
