import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({});
  const ASTRO_ID = "6958bde63adbac9b1c1da23e"; 

  // Camera physically band karne ke liye
  const stopLive = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    Object.values(pcs.current).forEach(pc => pc.close());
    pcs.current = {};
    setIsLive(false);
  };

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      
      // Backend mapping update
      socket.emit("join", ASTRO_ID);
      console.log("Host registered with ID:", ASTRO_ID);
    } catch (err) { alert("Camera access denied!"); }
  };

  useEffect(() => {
    socket.on("new-viewer", async ({ viewerId }) => {
      console.log("Viewer detected:", viewerId);
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcs.current[viewerId] = pc;

      // Offer se pehle tracks add karna mandatory hai
      streamRef.current?.getTracks().forEach(track => pc.addTrack(track, streamRef.current!));

      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit("ice-candidate", { to: viewerId, candidate: e.candidate });
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("send-offer-to-viewer", { to: viewerId, offer });
    });

    socket.on("answer-from-viewer", async ({ from, answer }) => {
      const pc = pcs.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = pcs.current[from];
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      stopLive();
      socket.off("new-viewer");
      socket.off("answer-from-viewer");
      socket.off("ice-candidate");
    };
  }, []);

  return (
    <div className="flex justify-center bg-zinc-950 h-[100dvh] overflow-hidden">
      <div className="w-full max-w-[450px] flex flex-col bg-black relative border-x border-zinc-800 shadow-2xl">
        <Header />
        <main className="flex-1 relative bg-zinc-900 flex items-center justify-center overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute bottom-10 w-full px-10 z-10">
            <button onClick={isLive ? stopLive : startLive} className={`w-full py-4 rounded-full font-bold transition-all shadow-lg ${isLive ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>
              {isLive ? "END LIVE" : "GO LIVE"}
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default AstroLiveHost;
