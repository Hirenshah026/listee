import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../components/chat/socket";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const astroSocketIdRef = useRef<string | null>(null);

  useEffect(() => {
    // ✅ CONNECT SOCKET
    if (!socket.connected) {
      socket.connect();
    }

    // ✅ CREATE PEER
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject"
        }
      ]
    });

    pcRef.current = pc;

    // ✅ RECEIVE REMOTE STREAM
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // ✅ SEND ICE TO ASTRO SOCKET (NOT astroId)
    pc.onicecandidate = (event) => {
      if (event.candidate && astroSocketIdRef.current) {
        socket.emit("ice-candidate", {
          to: astroSocketIdRef.current,
          candidate: event.candidate
        });
      }
    };

    // ✅ JOIN LIVE ROOM
    socket.emit("join-live-room", { astroId });

    // ✅ RECEIVE OFFER
    socket.on("offer-from-astro", async ({ offer, from }) => {
      astroSocketIdRef.current = from;

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer-to-astro", {
        to: from,
        answer
      });
    });

    // ✅ RECEIVE ICE FROM ASTRO
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
