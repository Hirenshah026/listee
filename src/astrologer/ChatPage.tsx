import React, { useEffect, useLayoutEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";

// --- Types ---
interface Message {
  _id?: string;
  text?: string;
  image?: string;
  senderId: string;
  receiverId: string;
  createdAt?: string;
  isBot?: boolean;
}

interface CallOverlayProps {
  userId: string | undefined;
  targetUser: any;
}

// --- 1. CALL OVERLAY COMPONENT (FORWARD REF) ---
const CallOverlay = forwardRef((props: CallOverlayProps, ref) => {
  const { userId, targetUser } = props;
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const [isDummy, setIsDummy] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useImperativeHandle(ref, () => ({
    startCall: (type: 'voice' | 'video') => { startCall(type); }
  }));

  useEffect(() => {
    if (!userId) return;
    socket.on("call-made", (data) => setIncomingCall(data));
    socket.on("answer-made", async ({ answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      try { if (peerConnection.current) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { }
    });
    socket.on("call-ended", () => stopAllTracks());
    return () => {
      socket.off("call-made");
      socket.off("answer-made");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, [userId]);

  const stopAllTracks = () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (peerConnection.current) { peerConnection.current.close(); peerConnection.current = null; }
    setIsCalling(false); setIncomingCall(null); setLocalStream(null); setCallType(null); setIsDummy(false);
  };

  const setupPeer = (stream: MediaStream, targetId: string) => {
    peerConnection.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));
    peerConnection.current.onicecandidate = (e) => { if (e.candidate) socket.emit("ice-candidate", { to: targetId, candidate: e.candidate }); };
    peerConnection.current.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
  };

  const startCall = async (type: 'voice' | 'video') => {
    if (!targetUser) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
      setCallType(type); setIsCalling(true); setLocalStream(stream);
      setupPeer(stream, targetUser._id);
      const offer = await peerConnection.current!.createOffer();
      await peerConnection.current!.setLocalDescription(offer);
      socket.emit("call-user", { to: targetUser._id, offer, from: userId, type });
      setTimeout(() => { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }, 500);
    } catch (err) {
      setCallType(type); setIsCalling(true); setIsDummy(true);
      socket.emit("call-user", { to: targetUser._id, offer: null, from: userId, type, isDummy: true });
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      if (incomingCall.isDummy) {
        setCallType(incomingCall.type); setIsCalling(true); setIncomingCall(null); setIsDummy(true);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: incomingCall.type === 'video', audio: true });
      setCallType(incomingCall.type); setIsCalling(true); setIncomingCall(null); setLocalStream(stream);
      setupPeer(stream, incomingCall.from);
      await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await peerConnection.current!.createAnswer();
      await peerConnection.current!.setLocalDescription(answer);
      socket.emit("make-answer", { to: incomingCall.from, answer });
      setTimeout(() => { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }, 500);
    } catch (err) {
      setCallType(incomingCall.type); setIsCalling(true); setIncomingCall(null); setIsDummy(true);
    }
  };

  return (
    <>
      {incomingCall && !isCalling && (
        <div className="fixed inset-0 z-[2200] bg-[#0b141a] flex flex-col items-center justify-around text-white p-6">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-zinc-700 rounded-full mb-4 border-4 border-yellow-400 overflow-hidden">
              <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="User" />
            </div>
            <h2 className="text-2xl font-bold">{targetUser?.name || "User"}</h2>
            <p className="text-yellow-400 mt-2">Incoming {incomingCall.type} call...</p>
          </div>
          <div className="flex gap-16">
            <button onClick={() => { socket.emit("end-call", { to: incomingCall.from }); setIncomingCall(null); }} className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">✕</button>
            <button onClick={acceptCall} className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-pulse">✔</button>
          </div>
        </div>
      )}

      {isCalling && (
        <div className="fixed inset-0 z-[2300] bg-[#0b141a] flex flex-col items-center justify-center overflow-hidden">
          {!isDummy && callType === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-4 border-yellow-500 mb-6 overflow-hidden">
                <img src={targetUser?.image || "/banners/astrouser.jpg"} className="w-full h-full object-cover" alt="User" />
              </div>
              <h3 className="text-white text-2xl font-bold">{targetUser?.name}</h3>
              <p className="text-yellow-500 mt-2 font-mono tracking-widest">{callType === 'video' ? "CONNECTING VIDEO..." : "VOICE CALL ACTIVE"}</p>
            </div>
          )}
          {callType === 'video' && (
            <div className="absolute top-6 right-6 w-28 h-40 border-2 border-white/20 rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl z-[2400]">
              {!isDummy ? <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Self View</div>}
            </div>
          )}
          <div className="absolute bottom-12">
            <button onClick={() => { socket.emit("end-call", { to: targetUser?._id || incomingCall?.from }); stopAllTracks(); }} className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center border-4 border-white/10 active:scale-90">
              📞
            </button>
          </div>
        </div>
      )}
    </>
  );
});

// --- 2. MAIN CHAT PAGE COMPONENT ---
const ChatPage = () => {
  const { user, loading: userLoading } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const astrologer = location.state?.astrologer;

  const CURRENT_USER_ID = user?._id;
  const ASTRO_ID = astrologer?._id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [botQuestions, setBotQuestions] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(-1);
  const [isPlanActive, setIsPlanActive] = useState<boolean>(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const callOverlayRef = useRef<any>(null);

  const canChat = timeLeft > 0 || isPlanActive;

  useEffect(() => {
    const fixViewport = () => {
      if (containerRef.current && window.visualViewport) {
        containerRef.current.style.height = `${window.visualViewport.height}px`;
        window.scrollTo(0, 0);
      }
    };
    window.visualViewport?.addEventListener("resize", fixViewport);
    fixViewport();
    return () => window.visualViewport?.removeEventListener("resize", fixViewport);
  }, []);

  useEffect(() => {
    if (userLoading || !user || !ASTRO_ID) return;
    if (!socket.connected) socket.connect();
    socket.emit("join", CURRENT_USER_ID);
    socket.emit("start-chat-timer", { userId: CURRENT_USER_ID, astroId: ASTRO_ID, initialTime: user.freeChatTime || 0 });
    socket.on("timer-update", (data) => setTimeLeft(data.timeLeft * 1000));
    socket.on("timer-ended", () => { setTimeLeft(0); setIsPlanActive(false); });
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => (prev.some(m => m._id === msg._id) ? prev : [...prev, msg]));
    });
    setIsPlanActive(user.isPlanActive || false);
    setInitialLoadDone(true);
    return () => { socket.off("timer-update"); socket.off("timer-ended"); socket.off("receiveMessage"); };
  }, [user, userLoading, ASTRO_ID, CURRENT_USER_ID]);

  useEffect(() => {
    if (!CURRENT_USER_ID || !ASTRO_ID) return;
    axios.get(`http://10.198.74.180:5000/api/messages/${CURRENT_USER_ID}/${ASTRO_ID}`)
      .then(res => { if (res.data.messages) setMessages(res.data.messages); });
    axios.get("http://10.198.74.180:5000/api/questions").then(res => {
      if (res.data.success) setBotQuestions(res.data.questions);
    });
  }, [CURRENT_USER_ID, ASTRO_ID]);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, isTyping]);

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && !selectedFile) || !canChat) return;
    setInput(""); setSelectedFile(null); setImagePreview(null);
    try {
      let savedUserMsg;
      if (selectedFile && !customText) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("text", textToSend);
        formData.append("senderId", CURRENT_USER_ID!);
        formData.append("receiverId", ASTRO_ID!);
        const res = await axios.post("http://10.198.74.180:5000/api/messages/", formData);
        savedUserMsg = res.data.message;
      } else {
        const res = await axios.post("http://10.198.74.180:5000/api/messages", { text: textToSend, senderId: CURRENT_USER_ID!, receiverId: ASTRO_ID!, isBot: false });
        savedUserMsg = res.data.message;
      }
      setMessages(prev => [...prev, savedUserMsg]);
      socket.emit("sendMessage", savedUserMsg);

      if (timeLeft > 0 && questionIndex < botQuestions.length) {
        setTimeout(() => setIsTyping(true), 1000);
        setTimeout(async () => {
          const botRes = await axios.post("http://10.198.74.180:5000/api/messages", { text: botQuestions[questionIndex].answer, senderId: ASTRO_ID!, receiverId: CURRENT_USER_ID!, isBot: true });
          setIsTyping(false);
          setMessages(prev => [...prev, botRes.data.message]);
          socket.emit("sendMessage", botRes.data.message);
          setQuestionIndex(prev => prev + 1);
        }, 2500);
      }
    } catch (err) { console.error(err); }
  };

  const renderDateLabel = (dateStr: string, prevDateStr?: string) => {
    const d = new Date(dateStr).toLocaleDateString();
    const prevD = prevDateStr ? new Date(prevDateStr).toLocaleDateString() : null;
    if (d !== prevD) {
      const today = new Date().toLocaleDateString();
      return <div className="flex justify-center my-4"><span className="bg-[#d1e4f4] text-gray-600 text-[11px] px-3 py-1 rounded-md uppercase font-bold">{d === today ? "Today" : d}</span></div>;
    }
    return null;
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00";
    const totalSecs = Math.floor(ms / 1000);
    return `${Math.floor(totalSecs / 60).toString().padStart(2, '0')}:${(totalSecs % 60).toString().padStart(2, '0')}`;
  };

  if (userLoading || !initialLoadDone) return <div className="h-screen w-full bg-[#efeae2] flex items-center justify-center">Loading...</div>;

  return (
    <div className="fixed inset-0 w-full overflow-hidden bg-[#efeae2] flex justify-center">
      
      {/* 1. Call Overlay (Handles UI for calls) */}
      <CallOverlay ref={callOverlayRef} userId={CURRENT_USER_ID} targetUser={astrologer} />

      <div ref={containerRef} className="w-full max-w-[450px] flex flex-col relative overflow-hidden bg-[#efeae2]" style={{ height: '100dvh' }}>
        
        {/* HEADER */}
        <header className="absolute top-0 w-full h-[60px] bg-yellow-400 flex items-center justify-between px-3 shadow-md z-[200]">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-2xl">←</button>
            <div className="flex items-center gap-2" onClick={() => setShowProfileModal(true)}>
              <img src={astrologer?.image || "/banners/astrouser.jpg"} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="Astro" />
              <div>
                <p className="font-bold text-[15px] leading-tight">{astrologer?.name}</p>
                <p className="text-[10px] text-orange-900 font-bold uppercase">{timeLeft > 0 ? `⏱️ Free: ${formatTime(timeLeft)}` : isPlanActive ? "● Live Chat" : "Ended"}</p>
              </div>
            </div>
          </div>
          
          {/* Audio/Video Call Buttons */}
          <div className="flex gap-4 mr-2">
             <button onClick={() => callOverlayRef.current?.startCall('voice')} className="text-xl">📞</button>
             <button onClick={() => callOverlayRef.current?.startCall('video')} className="text-xl">📹</button>
          </div>
        </header>

        {/* CHAT AREA */}
        <main className="flex-1 overflow-y-auto px-4 pt-[70px] pb-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
          {messages.map((m, i) => (
            <div key={i}>
              {renderDateLabel(m.createdAt || new Date().toISOString(), messages[i - 1]?.createdAt)}
              <div className={`flex ${m.senderId === CURRENT_USER_ID ? "justify-end" : "justify-start"} mb-2`}>
                <div className={`max-w-[85%] p-2 rounded-xl shadow-sm ${m.senderId === CURRENT_USER_ID ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none"}`}>
                  {m.image && <img src={m.image} className="w-full max-h-64 object-cover rounded-lg mb-1" alt="Sent" />}
                  {m.text && <p className="text-[14px] break-words whitespace-pre-wrap">{m.text}</p>}
                  <p className="text-[9px] text-gray-400 text-right mt-1">{new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && <div className="text-[12px] text-gray-500 italic ml-2 animate-pulse">typing...</div>}
          <div ref={bottomRef} />
        </main>

        {/* FOOTER */}
        <footer className="flex-none p-3 pb-5 bg-white flex items-center gap-2 border-t z-[50]">
          <div className="flex-1 bg-gray-100 rounded-3xl flex items-center px-3 py-1.5">
            <button onPointerDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} className="text-xl text-gray-500 mr-2">📎</button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              disabled={!canChat}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
              className="flex-1 bg-transparent outline-none text-[16px]"
              placeholder="Message..."
            />
          </div>
          <button onPointerDown={(e) => { e.preventDefault(); sendMessage(); }} className={`w-11 h-11 rounded-full flex items-center justify-center text-white ${canChat ? 'bg-[#00a884]' : 'bg-gray-400'}`}>➤</button>
        </footer>

        {/* MODALS */}
        {showProfileModal && (
          <div className="absolute inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center" onClick={() => setShowProfileModal(false)}>
             <img src={astrologer?.image || "/banners/astrouser.jpg"} className="max-w-[90%] max-h-[70vh] object-contain" alt="Profile" />
          </div>
        )}

        {imagePreview && (
          <div className="absolute inset-0 bg-black z-[400] flex flex-col">
            <header className="p-4 text-white"><button onClick={() => { setImagePreview(null); setSelectedFile(null); }}>✕</button></header>
            <div className="flex-1 flex items-center justify-center"><img src={imagePreview} className="max-w-full max-h-[70vh] object-contain" alt="Preview" /></div>
            <div className="p-4 flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-zinc-800 text-white p-3 rounded-xl" placeholder="Caption..." />
              <button onPointerDown={(e) => { e.preventDefault(); sendMessage(); }} className="bg-[#00a884] w-12 h-12 rounded-full text-white">✔</button>
            </div>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) { setSelectedFile(file); setImagePreview(URL.createObjectURL(file)); }
      }} />
    </div>
  );
};

export default ChatPage;
