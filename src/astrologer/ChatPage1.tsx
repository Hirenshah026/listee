import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";

interface Message {
  _id?: string;
  text?: string;
  image?: string;
  senderId: string;
  receiverId: string;
  createdAt?: string;
  isBot?: boolean;
}

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

  const canChat = timeLeft > 0 || isPlanActive;

  // 1. KEYBOARD & VIEWPORT FIX (NO-SHAVE HEADER)
  useEffect(() => {
    const fixViewport = () => {
      if (containerRef.current && window.visualViewport) {
        containerRef.current.style.height = `${window.visualViewport.height}px`;
        window.scrollTo(0, 0);
      }
    };
    window.visualViewport?.addEventListener("resize", fixViewport);
    window.visualViewport?.addEventListener("scroll", fixViewport);
    fixViewport();
    return () => {
      window.visualViewport?.removeEventListener("resize", fixViewport);
      window.visualViewport?.removeEventListener("scroll", fixViewport);
    };
  }, []);

  // 2. LOGIC (SOCKET & TIMER)
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
  }, [user, userLoading, ASTRO_ID]);

  // 3. HISTORY & BOT
  useEffect(() => {
    if (!CURRENT_USER_ID || !ASTRO_ID) return;
    axios.get(`https://listee-backend.onrender.com/api/messages/${CURRENT_USER_ID}/${ASTRO_ID}`)
      .then(res => { if (res.data.messages) setMessages(res.data.messages); });
    axios.get("https://listee-backend.onrender.com/api/questions").then(res => {
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
    if (inputRef.current) inputRef.current.focus();
    try {
      let savedUserMsg;
      if (selectedFile && !customText) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("text", textToSend);
        formData.append("senderId", CURRENT_USER_ID!);
        formData.append("receiverId", ASTRO_ID!);
        const res = await axios.post("https://listee-backend.onrender.com/api/messages/", formData);
        savedUserMsg = res.data.message;
      } else {
        const res = await axios.post("https://listee-backend.onrender.com/api/messages", { text: textToSend, senderId: CURRENT_USER_ID!, receiverId: ASTRO_ID!, isBot: false });
        savedUserMsg = res.data.message;
      }
      setMessages(prev => [...prev, savedUserMsg]);
      socket.emit("sendMessage", savedUserMsg);

      if (timeLeft > 0 && questionIndex < botQuestions.length) {
        setTimeout(() => setIsTyping(true), 1000);
        setTimeout(async () => {
          const botRes = await axios.post("https://listee-backend.onrender.com/api/messages", { text: botQuestions[questionIndex].answer, senderId: ASTRO_ID!, receiverId: CURRENT_USER_ID!, isBot: true });
          setIsTyping(false);
          setMessages(prev => [...prev, botRes.data.message]);
          socket.emit("sendMessage", botRes.data.message);
          setQuestionIndex(prev => prev + 1);
        }, 2500);
      }
    } catch (err) { console.error(err); }
  };

  // DATE FORMATTER LOGIC
  const renderDateLabel = (dateStr: string, prevDateStr?: string) => {
    const d = new Date(dateStr).toLocaleDateString();
    const prevD = prevDateStr ? new Date(prevDateStr).toLocaleDateString() : null;
    if (d !== prevD) {
      const today = new Date().toLocaleDateString();
      const label = d === today ? "Today" : d;
      return <div className="flex justify-center my-4"><span className="bg-[#d1e4f4] text-gray-600 text-[11px] px-3 py-1 rounded-md uppercase font-bold shadow-sm">{label}</span></div>;
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
      <div ref={containerRef} className="w-full max-w-[450px] flex flex-col relative overflow-hidden bg-[#efeae2]" style={{ height: '100dvh' }}>
        
        {/* HEADER: Z-INDEX 200 & TOP 0 - Hamesha Chipka Rahega */}
        <header className="absolute top-0 w-full h-[60px] bg-yellow-400 flex items-center justify-between px-3 shadow-md z-[200]">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-2xl">←</button>
            <div className="flex items-center gap-2" onClick={() => setShowProfileModal(true)}>
              <img src={astrologer?.image || "/banners/astrouser.jpg"} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <div>
                <p className="font-bold text-[15px] leading-tight">{astrologer?.name}</p>
                <p className="text-[10px] text-orange-900 font-bold uppercase">{timeLeft > 0 ? `⏱️ Free: ${formatTime(timeLeft)}` : isPlanActive ? "● Live Chat" : "Ended"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* CHAT AREA: Isme Date Logic laga di hai */}
        <main className="flex-1 overflow-y-auto px-4 pt-[70px] pb-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
          {messages.map((m, i) => (
            <div key={i}>
              {renderDateLabel(m.createdAt || new Date().toISOString(), messages[i - 1]?.createdAt)}
              <div className={`flex ${m.senderId === CURRENT_USER_ID ? "justify-end" : "justify-start"} mb-2`}>
                <div className={`max-w-[85%] p-2 rounded-xl shadow-sm ${m.senderId === CURRENT_USER_ID ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none"}`}>
                  {m.image && <img src={m.image} className="w-full max-h-64 object-cover rounded-lg mb-1" />}
                  {m.text && <p className="text-[14px] break-words whitespace-pre-wrap">{m.text}</p>}
                  <p className="text-[9px] text-gray-400 text-right mt-1">{new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && <div className="text-[12px] text-gray-500 italic ml-2 animate-pulse">typing...</div>}
          <div ref={bottomRef} />
        </main>

        {/* FOOTER: No Blur Logic */}
        <footer className="flex-none p-3 pb-5 bg-white flex items-center gap-2 border-t z-[50] safe-area-bottom">
          <div className="flex-1 bg-gray-100 rounded-3xl flex items-center px-3 py-1.5 border border-gray-200">
            <button onPointerDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} className="text-xl text-gray-500 mr-2 p-1">📎</button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              disabled={!canChat}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
              className="flex-1 bg-transparent border-none outline-none py-1.5 text-[16px]"
              placeholder="Message..."
            />
          </div>
          <button
            onPointerDown={(e) => { e.preventDefault(); sendMessage(); }}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg ${canChat ? 'bg-[#00a884]' : 'bg-gray-400'}`}
          >
            ➤
          </button>
        </footer>

        {/* PROFILE MODAL */}
        {showProfileModal && (
          <div className="absolute inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center" onClick={() => setShowProfileModal(false)}>
            <div className="absolute top-5 left-5 text-white text-xl">✕ {astrologer?.name}</div>
            <img src={astrologer?.image || "/banners/astrouser.jpg"} className="max-w-[90%] max-h-[70vh] object-contain shadow-2xl" />
          </div>
        )}

        {/* IMAGE PREVIEW */}
        {imagePreview && (
          <div className="absolute inset-0 bg-black z-[400] flex flex-col">
            <header className="p-4 text-white flex justify-between"><button onClick={() => { setImagePreview(null); setSelectedFile(null); }}>✕</button> Preview</header>
            <div className="flex-1 flex items-center justify-center p-2"><img src={imagePreview} className="max-w-full max-h-[70vh] object-contain" /></div>
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