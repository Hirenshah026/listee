import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../components/chat/socket";

const LiveCallPage = () => {
  const { astroId } = useParams<{ astroId: string }>();

  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const astroSocketRef = useRef<string | null>(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // ✅ REGISTER VIEWER
    const viewerId = `viewer-${Date.now()}`;
    socket.emit("join", viewerId);

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

    pcRef.current = pc;

    // ✅ FIX: COLLECT TRACKS PROPERLY
    const remoteStream = new MediaStream();

    pc.ontrack = (event) => {
      console.log("🎥 Track received:", event.track.kind);
      remoteStream.addTrack(event.track);

      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && astroSocketRef.current) {
        socket.emit("ice-candidate", {
          to: astroSocketRef.current,
          candidate: event.candidate,
        });
      }
    };

    socket.emit("join-live-room", { astroId });

    socket.on("offer-from-astro", async ({ offer, from }) => {
      console.log("📡 Offer received");

      astroSocketRef.current = from;

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer-to-astro", {
        to: from,
        answer,
      });

      console.log("📤 Answer sent");
    });

    socket.on("ice-candidate", ({ candidate }) => {
      if (candidate) {
        pc.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off("offer-from-astro");
      socket.off("ice-candidate");
      pc.close();
    };
  }, [astroId]);

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="h-full"
      />
    </div>
  );
};

export default LiveCallPage;
