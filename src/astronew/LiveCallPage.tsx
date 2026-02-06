import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { VolumeX, Volume2, X } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  
  // Mute logic to bypass browser autoplay blocks
  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");

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

    socket.on("offer-from-astro", async ({ offer, from }) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.emit("join-live-room", { astroId, role: "viewer" });

    return () => { pc.current?.close(); socket.off("offer-from-astro"); };
  }, [astroId]);

  const handleUnmute = () => {
    setIsMuted(false);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.play(); // Click par play trigger karna safe hai
    }
  };

  return (
    <div className="h-screen w-full bg-black flex justify-center overflow-hidden">
      <div className="w-full max-w-[450px] h-full relative">
        
        {/* Viewer video - Start muted to ensure it plays immediately */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          muted={isMuted} 
          className="w-full h-full object-cover" 
        />

        {/* Big Unmute Button Overlay */}
        {isMuted && status === "Live" && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-50">
            <button 
              onClick={handleUnmute}
              className="bg-yellow-500 p-5 rounded-full shadow-2xl scale-110 active:scale-95 transition-all"
            >
              <VolumeX size={30} className="text-black" />
            </button>
            <p className="text-white font-bold mt-4 text-sm animate-pulse tracking-widest">TAP TO UNMUTE & LISTEN</p>
          </div>
        )}

        {/* Loading State */}
        {status === "Connecting..." && (
          <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <p className="text-yellow-500 mt-4 text-[10px] font-bold tracking-[0.2em]">CONNECTING TO ASTRO...</p>
          </div>
        )}

        {/* Close Button */}
        <button onClick={() => navigate(-1)} className="absolute top-5 right-5 p-2 bg-black/40 rounded-full text-white z-50"><X size={24}/></button>

        {/* Volume Indicator (When Unmuted) */}
        {!isMuted && (
          <div className="absolute bottom-10 right-5 p-3 bg-black/40 rounded-full text-white">
            <Volume2 size={20} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCallPage;