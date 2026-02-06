import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { VolumeX, X } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  
  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.current.ontrack = (e) => {
      console.log("Stream received!");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setStatus("Live");
      }
    };

    pc.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit("ice-candidate", { to: astroId, candidate: e.candidate });
    };

    // Backend Line 151: offer-from-astro
    socket.on("offer-from-astro", async ({ offer, from }) => {
      try {
        await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.current?.createAnswer();
        await pc.current?.setLocalDescription(answer);
        // Backend Line 154: answer-to-astro
        socket.emit("answer-to-astro", { to: from, answer });
      } catch (err) { console.error("WebRTC Offer Error:", err); }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && pc.current) {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    });

    socket.on("stream-ended", () => navigate(-1));

    socket.emit("join-live-room", { astroId, role: "viewer" });

    return () => {
      pc.current?.close();
      socket.off("offer-from-astro");
      socket.off("ice-candidate");
      socket.off("stream-ended");
    };
  }, [astroId]);

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      <video 
        ref={remoteVideoRef} 
        autoPlay 
        playsInline 
        muted={isMuted} 
        className="w-full h-full object-cover" 
      />

      {status === "Connecting..." && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-t-yellow-500 rounded-full animate-spin"></div>
          <p className="text-yellow-500 mt-4 font-bold">JOINING LIVE...</p>
        </div>
      )}

      {isMuted && status === "Live" && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <button 
            onClick={() => { setIsMuted(false); remoteVideoRef.current?.play(); }}
            className="bg-yellow-500 p-6 rounded-full font-bold shadow-2xl animate-bounce"
          >
            <VolumeX size={32} className="text-black" />
            <p className="text-black text-[10px] mt-2 font-black uppercase">TAP TO LISTEN</p>
          </button>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="absolute top-5 right-5 p-2 bg-white/10 rounded-full text-white z-[100]"><X/></button>
    </div>
  );
};

export default LiveCallPage;