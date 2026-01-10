import { useEffect, useRef, useState } from "react";
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

  // 1. Load Bot Questions
  useEffect(() => {
    axios.get("http://10.18.209.180:5000/api/questions").then(res => {
      if (res.data.success) setBotQuestions(res.data.questions);
    });
  }, []);

  // 2. Initial Data Sync
  useEffect(() => {
    if (!userLoading && user) {
      setTimeLeft((user.freeChatTime || 0) * 1000);
      setIsPlanActive(user.isPlanActive || false);
      setInitialLoadDone(true);
    }
  }, [user, userLoading]);

  // 3. Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1000 ? 0 : prev - 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 4. Messages & Socket logic
  useEffect(() => {
    if (!CURRENT_USER_ID || !ASTRO_ID) return;
    
    // Fetch History
    axios.get(`http://10.18.209.180:5000/api/messages/${CURRENT_USER_ID}/${ASTRO_ID}`)
      .then(res => { if(res.data.messages?.length > 0) setMessages(res.data.messages); });

    if (!socket.connected) socket.connect();
    socket.emit("join", CURRENT_USER_ID);
    
    // Duplicate check for real-time messages
    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => {
        const isDuplicate = prev.some(m => m._id === msg._id || (m.text === msg.text && m.createdAt === msg.createdAt));
        if (isDuplicate) return prev;
        return [...prev, msg];
      });
    });

    return () => { socket.off("receiveMessage"); };
  }, [CURRENT_USER_ID, ASTRO_ID]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const canChat = timeLeft > 0 || isPlanActive;

  // 5. SEND MESSAGE & BOT FLOW
  const sendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && !selectedFile) || !canChat) return;

    // Reset UI
    setInput(""); 
    setSelectedFile(null); 
    setImagePreview(null);
    
    // Maintain focus on mobile
    setTimeout(() => inputRef.current?.focus(), 50);

    try {
      let savedUserMsg;
      // User Message Save
      if (selectedFile && !customText) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("text", textToSend);
        formData.append("senderId", CURRENT_USER_ID!);
        formData.append("receiverId", ASTRO_ID!);
        const res = await axios.post("http://10.18.209.180:5000/api/messages/", formData);
        savedUserMsg = res.data.message;
      } else {
        const res = await axios.post("http://10.18.209.180:5000/api/messages", {
          text: textToSend, senderId: CURRENT_USER_ID!, receiverId: ASTRO_ID!, isBot: false
        });
        savedUserMsg = res.data.message;
      }
      
      setMessages(prev => [...prev, savedUserMsg]);
      socket.emit("sendMessage", savedUserMsg);

      // Bot Auto-Reply Flow
      if (botQuestions.length > 0 && questionIndex < botQuestions.length) {
        // Typing start delay
        setTimeout(() => setIsTyping(true), 800);

        setTimeout(async () => {
          try {
            const botRes = await axios.post("http://10.18.209.180:5000/api/messages", {
              text: botQuestions[questionIndex].answer,
              senderId: ASTRO_ID!,
              receiverId: CURRENT_USER_ID!,
              isBot: true
            });

            const savedBotMsg = botRes.data.message;
            setIsTyping(false); 
            setMessages(prev => [...prev, savedBotMsg]);
            socket.emit("sendMessage", savedBotMsg); 
            setQuestionIndex(prev => prev + 1);
          } catch (err) {
            setIsTyping(false);
            console.error("Bot Reply Error", err);
          }
        }, 2500); // 2.5s delay for natural feeling
      }
    } catch (err) { 
        console.error("Send Error", err); 
    }
  };

  if (userLoading || !initialLoadDone) return <div className="h-screen flex items-center justify-center bg-[#efeae2]">Connecting to Astro...</div>;

  return (
    <div className="fixed inset-0 bg-zinc-900 flex justify-center items-center overflow-hidden overscroll-none">
      <div className="w-full max-w-md h-[100dvh] flex flex-col bg-[#efeae2] relative shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <header className="flex-none h-[65px] bg-yellow-400 p-2 flex items-center justify-between shadow-md z-40">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1 text-2xl font-bold">←</button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowProfileModal(true)}>
              <img src={astrologer?.image || "/banners/astrouser.jpg"} className="w-10 h-10 rounded-full border border-white object-cover" />
              <div>
                <p className="font-bold text-[15px] leading-tight">{astrologer?.name}</p>
                <p className="text-[10px] text-orange-900 font-bold uppercase tracking-wider">
                  {timeLeft > 0 ? `⏱️ Free: ${Math.floor(timeLeft/60000)}m ${Math.floor((timeLeft%60000)/1000)}s` : isPlanActive ? "● Live Chat" : "Time Over"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* CHAT MAIN AREA */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
          {messages.map((m, index) => (
            <div key={index} className={`flex ${m.senderId === CURRENT_USER_ID ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-2 rounded-xl shadow-sm ${m.senderId === CURRENT_USER_ID ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none border-l-4 " + (m.isBot ? "border-yellow-400" : "border-transparent")}`}>
                {m.image && <img src={m.image} className="w-full max-h-64 object-cover rounded-lg mb-1" />}
                {m.text && <p className="text-[14px] text-gray-800 break-words whitespace-pre-wrap">{m.text}</p>}
                <p className="text-[9px] text-gray-400 text-right mt-1">{new Date(m.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-3 py-2 rounded-xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="text-[12px] text-gray-500 italic">{astrologer?.name} typing</span>
                <div className="flex gap-1"><span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span><span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-2" />
        </main>

        {/* FOOTER */}
        <footer className="flex-none bg-white p-2 flex items-end gap-2 z-30 border-t">
          <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-3 py-1 border border-gray-200">
            <button onPointerDown={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()} className="text-gray-500 p-1 rotate-45 text-xl">📎</button>
            <input 
              ref={inputRef}
              type="text" 
              value={input} 
              autoComplete="off"
              enterKeyHint="send"
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }} 
              placeholder={canChat ? "Type message..." : "Recharge to chat"} 
              className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-[16px]" 
            />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
               const file = e.target.files?.[0];
               if (file) { setSelectedFile(file); setImagePreview(URL.createObjectURL(file)); }
            }} />
          </div>
          <button onPointerDown={(e) => { e.preventDefault(); sendMessage(); }} className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-[#00a884] shadow-md transition-all active:scale-90">➤</button>
        </footer>

        {/* PROFILE MODAL */}
        {showProfileModal && (
          <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col" onClick={() => setShowProfileModal(false)}>
            <div className="w-full p-4 flex items-center text-white bg-black/40 shadow-lg">
                <button className="text-3xl mr-4" onClick={() => setShowProfileModal(false)}>✕</button>
                <span className="font-bold">{astrologer?.name}</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-2"><img src={astrologer?.image || "/banners/astrouser.jpg"} className="max-w-full max-h-full object-contain" /></div>
          </div>
        )}

        {/* IMAGE PREVIEW */}
        {imagePreview && (
          <div className="absolute inset-0 bg-black z-[110] flex flex-col">
            <header className="p-4 text-white flex justify-between items-center bg-black/50">
                <button onClick={() => { setImagePreview(null); setSelectedFile(null); }} className="text-xl">✕</button>
                <span className="font-semibold">Photo Preview</span>
                <div className="w-6"></div>
            </header>
            <div className="flex-1 flex items-center justify-center p-2">
                <img src={imagePreview} className="max-w-full max-h-[75vh] object-contain shadow-2xl" />
            </div>
            <div className="p-4 bg-black/60 flex flex-col gap-3">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Add caption..." className="bg-zinc-800 text-white p-4 rounded-xl outline-none border border-zinc-700 focus:border-[#00a884]" />
              <div className="flex justify-end pb-2">
                <button onPointerDown={(e) => { e.preventDefault(); sendMessage(); }} className="bg-[#00a884] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl">✔</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;