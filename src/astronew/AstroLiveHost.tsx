import React, { useState, useRef, useEffect } from "react";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import BottomNav from "./components/BottomNavNew"; // BottomNav import
import { Users, Mic, MicOff, Video, VideoOff, Power, LogOut } from "lucide-react";

const AstroLiveHost = () => {
  const { user } = useUser();
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({}); 
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ASTRO_ID = user?._id || "6958bde63adbac9b1c1da23e";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("join", ASTRO_ID);
    socket.on("update-viewers", (count: number) => setViewers(count));
    socket.on("receive-message", (msg: any) => setMessages((prev) => [...prev, msg]));

    socket.on("new-viewer", async ({ viewerId }) => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcs.current[viewerId] = pc;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current!));
      }
      pc.onicecandidate = (e) => { if (e.candidate) socket.emit("ice-candidate", { to: viewerId, candidate: e.candidate }); };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("send-offer-to-viewer", { to: viewerId, offer });
    });

    socket.on("answer-from-viewer", async ({ from, answer }) => {
      const pc = pcs.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    return () => {
      socket.off("new-viewer");
      socket.off("update-viewers");
      socket.off("receive-message");
    };
  }, [ASTRO_ID]);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      socket.emit("join-live-room", { astroId: ASTRO_ID, role: "host" });
    } catch (err) { alert("Camera Permission Required"); }
  };

  const stopLive = () => {
    if (window.confirm("End Live Session?")) {
      socket.emit("end-stream", { astroId: ASTRO_ID });
      streamRef.current?.getTracks().forEach(t => t.stop());
      setIsLive(false);
      // Room cleanup logic if needed or let socket disconnect handle it
      window.location.reload(); 
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-black flex justify-center fixed inset-0 overflow-hidden">
      <div className="w-full max-w-[450px] relative bg-zinc-950 flex flex-col shadow-2xl">
        
        <div className="flex-1 relative overflow-hidden bg-black">
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? 'hidden' : 'block'}`} />
          
          {isVideoOff && isLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-yellow-500 text-xs font-bold tracking-widest uppercase italic">Camera Paused</div>
          )}

          {isLive ? (
            <>
              {/* Header: Live Count & Red End Button */}
              <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-50">
                <div className="bg-red-600 px-3 py-1.5 rounded-full text-white text-[10px] font-black flex items-center gap-2 shadow-lg animate-pulse">
                  LIVE <span className="bg-black/20 px-2 rounded-full font-mono">{viewers}</span>
                </div>
                
                <button 
                  onClick={stopLive} 
                  className="bg-red-600 px-4 py-1.5 rounded-full text-white text-[10px] font-black flex items-center gap-2 border border-white/20 shadow-xl active:scale-95 transition-all"
                >
                  <LogOut size={14}/> END LIVE
                </button>
              </div>

              {/* Float Controls (Right Side) */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
                <button onClick={toggleMic} className={`p-4 rounded-full border shadow-xl transition-all ${isMuted ? 'bg-red-600 border-red-400' : 'bg-black/50 border-white/10'}`}>
                  {isMuted ? <MicOff size={22} className="text-white"/> : <Mic size={22} className="text-white"/>}
                </button>
                <button onClick={toggleVideo} className={`p-4 rounded-full border shadow-xl transition-all ${isVideoOff ? 'bg-red-600 border-red-400' : 'bg-black/50 border-white/10'}`}>
                  {isVideoOff ? <VideoOff size={22} className="text-white"/> : <Video size={22} className="text-white"/>}
                </button>
              </div>

              {/* Chat: Positioned Bottom Above Nav (if Nav was there) */}
              <div className="absolute bottom-[30px] left-0 w-full px-4 z-40 flex flex-col gap-2 max-h-[35%] overflow-y-auto scrollbar-hide pointer-events-none">
                {messages.map((m, i) => (
                  <div key={i} className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border-l-4 border-yellow-500 self-start max-w-[85%] pointer-events-auto shadow-md">
                    <p className="text-[12px] text-white">
                      <span className="text-yellow-400 font-bold mr-1.5">{m.user}:</span> {m.text}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </>
          ) : (
            /* Start Live Screen */
            <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-8 z-[100]">
               <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 shadow-2xl">
                  <Power size={40} className="text-yellow-500" />
               </div>
               <h1 className="text-white font-bold text-lg mb-8 tracking-widest uppercase">Live Broadcasting</h1>
               <button onClick={startLive} className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-2xl active:scale-95 transition-all text-sm uppercase">Go Live Now</button>
            </div>
          )}
        </div>

        {/* CONDITION: Hide BottomNav when Live */}
        {!isLive && (
          <div className="shrink-0 z-[100]">
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
};

export default AstroLiveHost;