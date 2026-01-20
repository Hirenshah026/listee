import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";

const ASTRO_ID = "ASTRO_ID_HERE"; // 🔴 Replace with real astroId (DB _id)

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // viewerId => PeerConnection
  const pcs = useRef<Record<string, RTCPeerConnection>>({});

  // ---------------- START LIVE ----------------
  const startLive = async () => {
    try {
      if (!socket.connected) socket.connect();

      socket.emit("join", ASTRO_ID); // IMPORTANT (backend mapping)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      setIsLive(true);
      console.log("🔴 Astro is LIVE");
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // ---------------- SOCKET EVENTS ----------------
  useEffect(() => {
    // NEW VIEWER JOINED
    const handleNewViewer = async ({ viewerId }: { viewerId: string }) => {
      console.log("👀 New viewer:", viewerId);

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

      pcs.current[viewerId] = pc;

      // ADD LOCAL STREAM TRACKS (CRITICAL)
      streamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current!);
      });

      // SEND ICE TO VIEWER
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: viewerId,
            candidate: event.candidate,
          });
        }
      };

      // CREATE OFFER
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("send-offer-to-viewer", { to: viewerId, offer });
    };

    // ANSWER FROM VIEWER
    const handleAnswer = async ({ from, answer }: any) => {
      console.log("📩 Answer from:", from);
      await pcs.current[from]?.setRemoteDescription(answer);
    };

    // ICE FROM VIEWER
    const handleIce = ({ from, candidate }: any) => {
      if (candidate && pcs.current[from]) {
        pcs.current[from].addIceCandidate(candidate);
      }
    };

    socket.on("new-viewer", handleNewViewer);
    socket.on("answer-from-viewer", handleAnswer);
    socket.on("ice-candidate", handleIce);

    return () => {
      socket.off("new-viewer", handleNewViewer);
      socket.off("answer-from-viewer", handleAnswer);
      socket.off("ice-candidate", handleIce);

      Object.values(pcs.current).forEach((pc) => pc.close());
      pcs.current = {};
    };
  }, []);

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col items-center bg-black h-screen justify-center text-white">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full max-w-[450px] h-[70vh] object-cover rounded-2xl border-2 border-yellow-500"
      />

      <button
        onClick={startLive}
        disabled={isLive}
        className={`mt-10 px-10 py-4 rounded-full font-bold ${
          isLive ? "bg-red-600" : "bg-yellow-500 text-black"
        }`}
      >
        {isLive ? "LIVE NOW" : "GO LIVE"}
      </button>
    </div>
  );
};

export default AstroLiveHost;
