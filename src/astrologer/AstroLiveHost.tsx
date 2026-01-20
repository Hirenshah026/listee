import React, { useRef, useEffect, useState } from "react";
import socket from "../components/chat/socket";

const ASTRO_ID = "PUT_REAL_ASTRO_DB_ID_HERE";

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Record<string, RTCPeerConnection>>({});

  /* ---------------- START LIVE ---------------- */
  const startLive = async () => {
    if (!socket.connected) socket.connect();

    socket.emit("join", ASTRO_ID);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    setIsLive(true);
    console.log("🔴 Astro LIVE");
  };

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    const handleNewViewer = async ({ viewerSocketId }: { viewerSocketId: string }) => {
      console.log("👀 New viewer:", viewerSocketId);

      if (!streamRef.current) return;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      });

      pcsRef.current[viewerSocketId] = pc;

      // ✅ ADD TRACKS FIRST
      streamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, streamRef.current!);
      });

      // ✅ ICE
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            to: viewerSocketId,
            candidate: e.candidate,
          });
        }
      };

      // ✅ CREATE OFFER IMMEDIATELY (NO negotiationneeded)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("send-offer-to-viewer", {
        to: viewerSocketId,
        offer,
      });

      console.log("📤 Offer sent to viewer");
    };

    const handleAnswer = async ({ from, answer }: any) => {
      console.log("📩 Answer received");

      const pc = pcsRef.current[from];
      if (!pc) return;

      await pc.setRemoteDescription(answer);
    };

    const handleIce = ({ from, candidate }: any) => {
      const pc = pcsRef.current[from];
      if (pc && candidate) {
        pc.addIceCandidate(candidate);
      }
    };

    socket.on("new-viewer", handleNewViewer);
    socket.on("answer-from-viewer", handleAnswer);
    socket.on("ice-candidate", handleIce);

    return () => {
      socket.off("new-viewer", handleNewViewer);
      socket.off("answer-from-viewer", handleAnswer);
      socket.off("ice-candidate", handleIce);

      Object.values(pcsRef.current).forEach(pc => pc.close());
      pcsRef.current = {};
    };
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-[70vh]"
      />

      <button
        onClick={startLive}
        disabled={isLive}
        className="mt-6 px-6 py-3 bg-yellow-500 text-black rounded"
      >
        {isLive ? "LIVE" : "GO LIVE"}
      </button>
    </div>
  );
};

export default AstroLiveHost;
