import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import CallOverlay from "./CallOverlay";

interface Message {
  _id?: string;
  text?: string;
  image?: string;
  senderId: string;
  receiverId: string;
  createdAt?: string;
  isBot?: boolean;
  read?: boolean; // ✅ isRead ko 'read' kar diya
}

const ChatPage = () => {
  const { user, loading: userLoading } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const astrologer = location.state?.astrologer;

  const CURRENT_USER_ID = user?._id;
  const ASTRO_ID = astrologer?._id;
  const API_URL = "https://listee-backend.onrender.com";

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

  const canChat = (timeLeft > 0) || (isPlanActive === true);

  // --- Mark Read Logic ---
  const markAsRead = async (sId: string, rId: string) => {
    if (!sId || !rId) return;
    try {
      await axios.post(`${API_URL}/api/messages/mark-read`, { senderId: sId, receiverId: rId });
      socket.emit("messages-read", { senderId: sId, receiverId: rId });
    } catch (err) { 
      console.error("Read update error:", err); 
    }
  };

  useEffect(() => {
    if (userLoading || !user || !ASTRO_ID || !CURRENT_USER_ID) return;

    if (user.isPlanActive === true || user.subscriptionStatus === "active") {
      setIsPlanActive(true);
    }

    if (!socket.connected) socket.connect();
    socket.emit("join", CURRENT_USER_ID);
    
    socket.emit("start-chat-timer", { 
      userId: CURRENT_USER_ID, 
      astroId: ASTRO_ID, 
      initialTime: user.freeChatTime || 0 
    });

    const onReceive = (msg: Message) => {
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      if (msg.senderId === ASTRO_ID) {
        markAsRead(ASTRO_ID, CURRENT_USER_ID);
      }
    };

    const handleReadUpdate = ({ senderId, receiverId }: { senderId: string, receiverId: string }) => {
      // ✅ Yahan 'read' property update ho rahi hai
      if (senderId === CURRENT_USER_ID && receiverId === ASTRO_ID) {
        setMessages(prev => prev.map(m => m.senderId === CURRENT_USER_ID ? { ...m, read: true } : m));
      }
    };

    socket.on("receiveMessage", onReceive);
    socket.on("messages-read-update", handleReadUpdate);
    socket.on("timer-update", (data) => setTimeLeft(data.timeLeft * 1000));
    socket.on("timer-ended", () => { 
        setTimeLeft(0); 
        if (user.isPlanActive !== true) setIsPlanActive(false);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messages-read-update");
      socket.off("timer-update");
      socket.off("timer-ended");
    };
  }, [user, userLoading, ASTRO_ID, CURRENT_USER_ID]);

  useEffect(() => {
    if (!CURRENT_USER_ID || !ASTRO_ID) return;
    
    axios.get(`${API_URL}/api/messages/${CURRENT_USER_ID}/${ASTRO_ID}`).then(res => {
      if (res.data.messages) {
        setMessages(res.data.messages);
        markAsRead(ASTRO_ID, CURRENT_USER_ID);
      }
      setInitialLoadDone(true);
    });

    axios.get(`${API_URL}/api/questions`).then(res => {
      if (res.data.success) setBotQuestions(res.data.questions);
    });
  }, [CURRENT_USER_ID, ASTRO_ID]);

  useLayoutEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, isTyping]);

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && !selectedFile) || !canChat) return;

    const tempText = textToSend;
    setInput(""); 
    setSelectedFile(null); 
    setImagePreview(null);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    try {
      let savedUserMsg;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("text", tempText);
        formData.append("senderId", CURRENT_USER_ID!);
        formData.append("receiverId", ASTRO_ID!);
        const res = await axios.post(`${API_URL}/api/messages/`, formData);
        savedUserMsg = res.data.message;
      } else {
        const res = await axios.post(`${API_URL}/api/messages`, { 
          text: tempText, senderId: CURRENT_USER_ID!, receiverId: ASTRO_ID!, isBot: false 
        });
        savedUserMsg = res.data.message;
      }

      setMessages(prev => [...prev, savedUserMsg]);
      socket.emit("sendMessage", savedUserMsg);

      if (timeLeft > 0 && questionIndex < botQuestions.length) {
        setTimeout(() => setIsTyping(true), 1000);
        setTimeout(async () => {
          const botRes = await axios.post(`${API_URL}/api/messages`, { 
            text: botQuestions[questionIndex].answer, 
            senderId: ASTRO_ID!, 
            receiverId: CURRENT_USER_ID!, 
            isBot: true 
          });
          setIsTyping(false);
          const botMsg = botRes.data.message;
          setMessages(prev => [...prev, botMsg]);
          socket.emit("sendMessage", botMsg);
          setQuestionIndex(prev => prev + 1);
        }, 2500);
      }
    } catch (err) { 
      console.error(err); 
      inputRef.current?.focus();
    }
  };

  const renderDateLabel = (dateStr: string, prevDateStr?: string) => {
    const d = new Date(dateStr).toLocaleDateString();
    const prevD = prevDateStr ? new Date(prevDateStr).toLocaleDateString() : null;
    if (d !== prevD) {
      return (
        <div className="flex justify-center my-4">
          <span className="bg-white/80 text-gray-500 text-[10px] px-3 py-1 rounded shadow-sm font-bold uppercase">
            {d === new Date().toLocaleDateString() ? "Today" : d}
          </span>
        </div>
      );
    }
    return null;
  };

  if (userLoading || !initialLoadDone) return <div className="h-screen w-full flex items-center justify-center font-bold">Loading...</div>;

  return (
    <div className="fixed inset-0 w-full overflow-hidden bg-[#efeae2] flex justify-center">
      <CallOverlay ref={callOverlayRef} userId={CURRENT_USER_ID} targetUser={astrologer} />
      
      <div ref={containerRef} className="w-full max-w-[450px] flex flex-col relative bg-[#efeae2]" style={{ height: '100dvh' }}>
        
        <header className="absolute top-0 w-full h-[65px] bg-yellow-400 flex items-center justify-between px-3 shadow-md z-[200]">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-2xl font-bold">←</button>
            <div className="flex items-center gap-2" onClick={() => setShowProfileModal(true)}>
              <img src={astrologer?.image || "/banners/astrouser.jpg"} className="w-11 h-11 rounded-full border-2 border-white object-cover" alt="astro" />
              <div>
                <p className="font-bold text-[15px] leading-tight">{astrologer?.name}</p>
                <div className="flex items-center">
                    {isPlanActive ? (
                        <span className="text-[9px] bg-green-700 text-white px-2 py-0.5 rounded-full font-bold uppercase">Plan Active</span>
                    ) : (
                        <p className="text-[10px] font-bold uppercase">⏱️ {Math.floor(timeLeft/60000)}:{(Math.floor(timeLeft/1000)%60).toString().padStart(2,'0')}</p>
                    )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => callOverlayRef.current?.startCall('voice')} className="p-2 text-xl">📞</button>
            <button onClick={() => callOverlayRef.current?.startCall('video')} className="p-2 text-xl">📹</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pt-[75px] pb-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed">
          {messages.map((m, i) => {
            const isMe = m.senderId === CURRENT_USER_ID;
            return (
              <div key={i}>
                {renderDateLabel(m.createdAt || new Date().toISOString(), messages[i - 1]?.createdAt)}
                <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                  <div className={`max-w-[85%] p-1.5 rounded-xl shadow-sm relative ${isMe ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none border-l-4 border-yellow-400"}`}>
                    {m.image && <img src={m.image} className="w-full max-h-64 object-cover rounded-lg mb-1" alt="sent" />}
                    <div className="flex flex-wrap items-end justify-end gap-2 px-1">
                        {m.text && <p className="text-[15px] text-gray-800 break-words whitespace-pre-wrap flex-1 min-w-0">{m.text}</p>}
                        <div className="flex items-center shrink-0 mb-[-2px]">
                            <p className="text-[10px] text-gray-400 font-medium uppercase">
                              {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                            </p>
                            {/* ✅ UI mein 'read' check kar raha hai */}
                            {isMe && !m.isBot && (
                                <div className={`flex items-center ml-1 ${m.read ? "text-blue-500" : "text-gray-400"}`}>
                                    <span className="text-[14px] font-bold">✓</span>
                                    <span className="text-[14px] font-bold -ml-1.5">✓</span>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {isTyping && <div className="text-[12px] text-gray-500 italic bg-white inline-block px-3 py-1 rounded-lg ml-2 animate-pulse">Astro is typing...</div>}
          <div ref={bottomRef} />
        </main>

        <footer className="flex-none p-3 pb-6 bg-[#f0f2f5] flex items-center gap-2 border-t z-[100]">
          <div className="flex-1 bg-white rounded-3xl flex items-center px-3 py-1.5 border border-gray-200 shadow-sm">
            <button onClick={() => fileInputRef.current?.click()} className="text-xl text-gray-500 mr-2 rotate-45">📎</button>
            <input 
              ref={inputRef} 
              type="text" 
              value={input} 
              disabled={!canChat} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if(e.key === 'Enter') {
                  e.preventDefault(); 
                  sendMessage();
                }
              }} 
              className="flex-1 bg-transparent border-none outline-none py-1.5" 
              placeholder={canChat ? "Type a message..." : "Chat Ended"} 
            />
          </div>
          <button 
            onMouseDown={(e) => e.preventDefault()} 
            onClick={() => sendMessage()} 
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${canChat ? 'bg-[#00a884]' : 'bg-gray-400'}`}
          >
            ➤
          </button>
        </footer>

        {showProfileModal && (
          <div className="fixed inset-0 bg-black/95 z-[500] flex flex-col items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
            <img src={astrologer?.image || "/banners/astrouser.jpg"} className="max-w-full max-h-[70vh] object-contain rounded-lg" alt="astro profile" />
            <p className="text-white mt-5 font-bold text-xl">{astrologer?.name}</p>
          </div>
        )}

        {imagePreview && (
          <div className="fixed inset-0 bg-black z-[600] flex flex-col">
            <header className="p-4 text-white flex justify-between items-center"><button onClick={() => { setImagePreview(null); setSelectedFile(null); }}>✕</button><span className="font-bold uppercase">Send Photo</span><div></div></header>
            <div className="flex-1 flex items-center justify-center p-2"><img src={imagePreview} className="max-w-full max-h-[70vh] object-contain" alt="preview" /></div>
            <div className="p-4 flex gap-2 bg-black/60">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-zinc-800 text-white p-3 rounded-2xl outline-none" placeholder="Add a caption..." />
              <button onClick={() => sendMessage()} className="bg-[#00a884] w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg">✔</button>
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
