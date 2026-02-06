import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/chat/socket";
import { X, VolumeX, Send, Volume2, Users } from "lucide-react";

const LiveCallPage = () => {
  const { astroId } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Auto Scroll for Viewer
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.current.ontrack = (e) => { if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = e.streams[0]; setStatus("Live"); } };
    pc.current.onicecandidate = (e) => { if (e.candidate) socket.emit("ice-candidate", { to: astroId, candidate: e.candidate }); };

    socket.on("offer-from-astro", async ({ offer, from }) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      socket.emit("answer-to-astro", { to: from, answer });
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && pc.current) await pc.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    });

    socket.on("update-viewers", (count) => setViewers(count));
    socket.on("receive-message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("stream-ended", () => navigate(-1));

    socket.emit("join-live-room", { astroId, role: "viewer" });

    return () => { socket.off("offer-from-astro"); socket.off("receive-message"); pc.current?.close(); };
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
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
            <span className="text-yellow-400 font-bold text-xs flex items-center gap-1"><Users size={12}/> {viewers}</span>
          </div>
          <button onClick={() => navigate(-1)} className="bg-black/40 p-2 rounded-full text-white"><X size={20}/></button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-zinc-900 flex items-center justify-center overflow-hidden">
          <video ref={remoteVideoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" />
          
          {/* Chat - Bottom margin adjusted to stay above input box */}
          <div className="absolute bottom-[90px] left-0 w-full px-4 z-40 max-h-[200px] overflow-y-auto flex flex-col items-start gap-2 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/5 animate-fade-in shadow-lg">
                <p className="text-[12px] text-white">
                  <span className="text-yellow-400 font-black mr-1">{m.user}:</span> {m.text}
                </p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {status === "Live" && isMuted && (
            <button onClick={() => {setIsMuted(false); remoteVideoRef.current?.play();}} className="absolute inset-0 m-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center z-50 animate-pulse">
              <VolumeX size={24} className="text-black" />
            </button>
          )}

          {status === "Connecting..." && (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[100]">
              <div className="w-8 h-8 border-2 border-t-yellow-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Fixed Chat Input at bottom */}
        <div className="p-4 bg-black/95 border-t border-white/5 flex gap-2 z-[100]">
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-zinc-900 text-white rounded-full px-5 py-2.5 text-sm outline-none border border-white/10 focus:border-yellow-500" placeholder="Type message..." />
            <button type="submit" className="bg-yellow-500 p-2.5 rounded-full text-black transition-transform active:scale-90"><Send size={18}/></button>
          </form>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 bg-zinc-900 rounded-full text-white">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
export default LiveCallPage;