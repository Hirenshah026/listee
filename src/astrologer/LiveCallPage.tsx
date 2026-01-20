import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../components/chat/socket";

const LiveCallPage = () => {
  const { astroId } = useParams<{ astroId: string }>();

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const astroSocketIdRef = useRef<string | null>(null);

  useEffect(() => {
    /* ---------------- SOCKET CONNECT ---------------- */
    if (!socket.connected) {
      socket.connect();
    }

    // ✅ REGISTER VIEWER (MANDATORY)
    const viewerId = `viewer-${Date.now()}`;
    socket.emit("join", viewerId);

    /* ---------------- PEER CONNECTION ---------------- */
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

    /* ---------------- REMOTE STREAM ---------------- */
    pc.ontrack = (event) => {
      console.log("🎥 Remote stream received");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    /* ---------------- SEND ICE ---------------- */
    pc.onicecandidate = (event) => {
      if (event.candidate && astroSocketIdRef.current) {
        socket.emit("ice-candidate", {
          to: astroSocketIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    /* ---------------- JOIN LIVE ---------------- */
    socket.emit("join-live-room", { astroId });

    /* ---------------- RECEIVE OFFER ---------------- */
    socket.on("offer-from-astro", async ({ offer, from }) => {
      console.log("📡 Offer received from astro");

      astroSocketIdRef.current = from;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer-to-astro", {
        to: from,
        answer,
      });
    });

    /* ---------------- RECEIVE ICE ---------------- */
    socket.on("ice-candidate", ({ candidate }) => {
      if (candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    /* ---------------- CLEANUP ---------------- */
    return () => {
      socket.off("offer-from-astro");
      socket.off("ice-candidate");
      pc.close();
    };
  }, [astroId]);

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-[450px] h-full object-cover"
      />
    </div>
  );
};

export default LiveCallPage;
