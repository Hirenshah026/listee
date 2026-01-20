import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";

const ASTRO_ID = "6958bc243adbac9b1c1da23a"; // REAL DB _id

const AstroLiveHost = () => {
  const [isLive, setIsLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<Record<string, RTCPeerConnection>>({});

  const startLive = async () => {
    if (!socket.connected) socket.connect();
    socket.emit("join", ASTRO_ID);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;
    setIsLive(true);
  };

  useEffect(() => {
  socket.on("new-viewer", ({ viewerSocketId }) => {
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

    pcs.current[viewerSocketId] = pc;

    // ✅ ADD TRACKS FIRST
    streamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, streamRef.current!);
    });

    // ✅ ICE
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: viewerSocketId,
          candidate: event.candidate,
        });
      }
    };

    // ✅ THIS IS THE FIX
    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("send-offer-to-viewer", {
        to: viewerSocketId,
        offer,
      });
    };
  });

  socket.on("answer-from-viewer", async ({ from, answer }) => {
    console.log("✅ Answer received from viewer");
    await pcs.current[from]?.setRemoteDescription(answer);
  });

  socket.on("ice-candidate", ({ from, candidate }) => {
    if (candidate) {
      pcs.current[from]?.addIceCandidate(candidate);
    }
  });

  return () => {
    socket.off("new-viewer");
    socket.off("answer-from-viewer");
    socket.off("ice-candidate");
  };
}, []);

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <video ref={videoRef} autoPlay muted playsInline className="h-[70vh]" />
      <button onClick={startLive} className="mt-6 px-6 py-3 bg-yellow-500">
        GO LIVE
      </button>
    </div>
  );
};

export default AstroLiveHost;
