import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { X, VolumeX, Send, Volume2 } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ],
      iceCandidatePoolSize: 10,
    });

    pc.current.ontrack = (event) => {
      console.log("Track received in production");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("Live");
      }
    };

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: astroId, candidate: event.candidate });
      }
    };

    // SERVER LINE 151
    socket.on("offer-from-astro", async ({ offer, from }) => {
      try {
        await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.current?.createAnswer();
        await pc.current?.setLocalDescription(answer);
        // SERVER LINE 154
        socket.emit("answer-to-astro", { to: from, answer });
      } catch (err) { console.error("WebRTC Error:", err); }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && pc.current) {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    });

    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("stream-ended", () => navigate(-1));

    socket.emit("join-live-room", { astroId, role: "viewer" });

    return () => {
      socket.off("offer-from-astro");
      socket.off("ice-candidate");
      socket.off("update-viewers");
      socket.off("receive-message");
      pc.current?.close();
    };
  }, [astroId, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit("send-message", { astroId, user: "User", text: chatInput });
    setChatInput("");
  };

  return (
    <div className="h-screen w-full bg-black flex justify-center fixed inset-0 overflow-hidden">
      <div className="w-full max-w-[450px] relative flex flex-col">
        <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" />
        
        {status === "Connecting..." && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[100]">
            <div className="w-8 h-8 border-2 border-t-yellow-500 rounded-full animate-spin"></div>
            <p className="text-yellow-500 mt-4 text-[10px] font-bold tracking-widest uppercase">Connecting to Render Server...</p>
          </div>
        )}

        {status === "Live" && isMuted && (
          <button onClick={() => {setIsMuted(false); remoteVideoRef.current?.play();}} className="absolute inset-0 m-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center z-[100] shadow-2xl">
            <VolumeX size={24} className="text-black" />
          </button>
        )}

        <div className="absolute bottom-20 left-4 w-full flex flex-col gap-2 max-h-[40%] overflow-y-auto pointer-events-none">
          {messages.map((m, i) => (
            <div key={i} className="bg-black/50 p-2 rounded-lg text-white text-[11px] self-start pointer-events-auto border border-white/10">
              <span className="text-yellow-400 font-bold">{m.user}:</span> {m.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="absolute bottom-4 left-0 w-full px-4 flex gap-2 z-[100]">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-zinc-900/80 backdrop-blur-md text-white rounded-full px-5 py-3 text-sm border border-white/10" placeholder="Type message..." />
          <button className="bg-yellow-500 p-3 rounded-full"><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
};
export default LiveCallPage;