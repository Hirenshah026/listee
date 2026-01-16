import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import CallOverlay from "./CallOverlay";

interface Message {
  _id?: string;
  text: string;
  image?: string;
  senderId: string;
  receiverId: string;
  createdAt: string; 
}

interface ChatUser {
  _id: string;
  name?: string;
  image?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

const WhatsAppImage = ({ src }: { src: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleFakeDownload = () => { setLoading(true); setTimeout(() => { setIsLoaded(true); setLoading(false); }, 1500); };
  
  const saveToDevice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `IMG_${Date.now()}.jpg`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (err) { console.error("Download error:", err); }
  };

  return (
    <div className="relative group overflow-hidden rounded-lg mb-1 min-w-[200px] min-h-[150px] bg-gray-200">
      {!isLoaded ? (
        <div className="relative cursor-pointer w-full h-full" onClick={handleFakeDownload}>
          <img src={src} alt="blur" className="w-full max-h-60 object-cover blur-xl grayscale opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            {loading ? <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <div className="bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition-all">↓</div>}
          </div>
        </div>
      ) : (
        <div className="relative">
          <img src={src} alt="sent" className="w-full max-h-80 object-cover rounded-lg animate-in fade-in zoom-in duration-300" />
          <button onClick={saveToDevice} className="absolute top-2 right-2 bg-black/40 p-1.5 rounded-full text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all">↓</button>
        </div>
      )}
    </div>
  );
};

const AstrologerChatPage = () => {
  const { user } = useUser();
  const ASTRO_ID = user?._id;
  const callRef = useRef<any>(null); // Ref for CallOverlay

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleVisualViewportResize = () => {
      if (window.visualViewport) {
        document.documentElement.style.setProperty('--vh', `${window.visualViewport.height}px`);
      }
    };
    window.visualViewport?.addEventListener("resize", handleVisualViewportResize);
    handleVisualViewportResize();
    return () => window.visualViewport?.removeEventListener("resize", handleVisualViewportResize);
  }, []);

  const fetchUsersData = async () => {
    if (!ASTRO_ID) return;
    try {
      const res = await axios.get(`https://listee-backend.onrender.com/api/messages/users/${ASTRO_ID}`);
      const userList = res.data.users || [];
      const enriched = await Promise.all(userList.map(async (u: ChatUser, i: number) => {
        const lastRes = await axios.get(`https://listee-backend.onrender.com/api/messages/last/${ASTRO_ID}/${u._id}`);
        return { 
            ...u, 
            name: u.name || `User ${i + 1}`, 
            lastMessage: lastRes.data?.text || (lastRes.data?.image ? "📷 Photo" : "No messages"),
            lastMessageTime: lastRes.data?.createdAt || "0"
        };
      }));
      setUsers(enriched.sort((a, b) => new Date(b.lastMessageTime!).getTime() - new Date(a.lastMessageTime!).getTime()));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsersData(); }, [ASTRO_ID]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 300);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useLayoutEffect(() => {
    scrollToBottom(messages.length <= 10 ? "auto" : "smooth");
  }, [messages]);

  useEffect(() => {
    if (!ASTRO_ID) return;
    if (!socket.connected) socket.connect();
    socket.emit("join", ASTRO_ID);

    if (selectedUser) {
      socket.emit("start-chat-timer", { userId: selectedUser._id, astroId: ASTRO_ID });
      socket.on("timer-update", (data) => setTimeLeft(data.timeLeft));
      socket.on("timer-ended", () => setTimeLeft(0));
      socket.on("receiveMessage", (msg: Message) => {
        if (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id) {
          setMessages(prev => (msg._id && prev.some(m => m._id === msg._id) ? prev : [...prev, msg]));
          fetchUsersData();
        }
      });
    }
    return () => { socket.off("timer-update"); socket.off("timer-ended"); socket.off("receiveMessage"); };
  }, [ASTRO_ID, selectedUser]);

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || !selectedUser || !ASTRO_ID) return;
    const formData = new FormData();
    formData.append("senderId", ASTRO_ID); 
    formData.append("receiverId", selectedUser._id); 
    formData.append("text", input);
    if (selectedFile) formData.append("image", selectedFile);
    
    try {
      const res = await axios.post("https://listee-backend.onrender.com/api/messages", formData);
      setMessages(prev => [...prev, res.data.message]);
      socket.emit("sendMessage", res.data.message);
      setInput(""); setSelectedFile(null); setImagePreview(null);
      fetchUsersData(); 
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (err) { console.error(err); }
  };

  const getMessageDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    today.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  const formatTimer = (secs: number) => {
    if (secs <= 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 flex justify-center bg-zinc-300 overflow-hidden">
      <div className="w-full max-w-[450px] flex flex-col bg-white shadow-2xl relative overflow-hidden" style={{ height: 'var(--vh, 100vh)' }}>
        
        {/* Calling Component Integrated */}
        <CallOverlay ref={callRef} userId={ASTRO_ID} targetUser={selectedUser} />

        {!selectedUser ? (
          <>
            <Header />
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3 border-b text-yellow-600 font-bold bg-yellow-50 sticky top-0 z-10">Recent Chats</div>
              {users.map(u => (
                <div key={u._id} onClick={() => { setSelectedUser(u); axios.get(`https://listee-backend.onrender.com/api/messages/${ASTRO_ID}/${u._id}`).then(res => setMessages(res.data.messages || [])); }} className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors">
                  <img src={u.image || "/banners/astrouser.jpg"} className="w-12 h-12 rounded-full object-cover border" alt="user" />
                  <div className="flex-1 truncate">
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{u.lastMessageTime !== "0" && new Date(u.lastMessageTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{u.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
            <BottomNav />
          </>
        ) : (
          <div className="flex flex-col h-full bg-[#efeae2]">
            <header className="flex-none bg-yellow-400 p-3 flex items-center justify-between shadow-md z-50">
              <div className="flex items-center gap-2">
                <button onClick={() => { setSelectedUser(null); setTimeLeft(0); }} className="text-2xl font-bold pr-2">←</button>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfileModal(true)}>
                  <img src={selectedUser.image || "/banners/astrouser.jpg"} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  <div>
                    <p className="font-bold leading-none">{selectedUser.name}</p>
                    <p className="text-[11px] font-bold text-orange-900 mt-1 uppercase">⏱️ {formatTimer(timeLeft)}</p>
                  </div>
                </div>
              </div>
              
              {/* Calling Buttons Added Back */}
              <div className="flex items-center gap-5 pr-2">
                <button onClick={() => callRef.current?.startCall('voice')} className="text-xl active:scale-90 p-1">📞</button>
                <button onClick={() => callRef.current?.startCall('video')} className="text-2xl active:scale-90 p-1">📹</button>
              </div>
            </header>

            <main ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed relative">
              {messages.map((m, i) => {
                const showDate = i === 0 || getMessageDate(m.createdAt) !== getMessageDate(messages[i-1].createdAt);
                return (
                  <React.Fragment key={i}>
                    {showDate && (
                      <div className="flex justify-center my-2">
                        <span className="bg-white/70 px-3 py-1 rounded text-[10px] font-bold text-gray-500 uppercase">{getMessageDate(m.createdAt)}</span>
                      </div>
                    )}
                    <div className={`flex ${m.senderId === ASTRO_ID ? "justify-end" : "justify-start"}`}>
                      <div className={`p-1.5 rounded-xl max-w-[85%] shadow-sm ${m.senderId === ASTRO_ID ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none border-l-4 border-yellow-400"}`}>
                        {m.image && <WhatsAppImage src={m.image} />}
                        {m.text && <p className="px-1 text-[14.5px] text-gray-800 break-words whitespace-pre-wrap">{m.text}</p>}
                        <p className="text-[9px] text-gray-400 text-right px-1 mt-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={bottomRef} />
              {showScrollBtn && (
                <button onPointerDown={(e) => { e.preventDefault(); scrollToBottom(); }} className="absolute bottom-4 right-5 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 z-[60] border active:scale-90 transition-all">↓</button>
              )}
            </main>

            <footer className="flex-none p-2 pb-5 bg-white flex items-center gap-2 border-t z-50">
              <div className="flex-1 bg-gray-100 rounded-3xl flex items-center px-3 py-1 border border-gray-200 shadow-inner">
                <button onPointerDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} className="text-xl text-gray-500 mr-2 rotate-45">📎</button>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 bg-transparent outline-none py-2 text-[16px]" />
              </div>
              <button onPointerDown={(e) => { e.preventDefault(); sendMessage(); }} className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg bg-yellow-600 text-white active:scale-95 transition-all">➤</button>
            </footer>

            {showProfileModal && (
              <div className="absolute inset-0 bg-black/90 z-[150] flex flex-col items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
                <img src={selectedUser.image || "/banners/astrouser.jpg"} className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-lg" alt="user profile" />
                <div className="mt-4 text-white text-center">
                  <p className="text-xl font-bold">{selectedUser.name}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {imagePreview && (
          <div className="absolute inset-0 bg-black z-[200] flex flex-col">
            <header className="p-4 text-white flex justify-between items-center bg-black/50">
              <button onClick={() => { setImagePreview(null); setSelectedFile(null); }} className="text-2xl">✕</button>
              <span className="font-bold text-sm uppercase">Preview</span>
              <div className="w-8" />
            </header>
            <div className="flex-1 flex items-center justify-center p-2 bg-zinc-900">
              <img src={imagePreview} className="max-w-full max-h-[70vh] object-contain shadow-2xl" />
            </div>
            <div className="p-4 pb-8 flex gap-2 bg-black/60 backdrop-blur-md">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-zinc-800 text-white p-3 rounded-2xl outline-none border border-zinc-700" placeholder="Add a caption..." />
              <button onPointerDown={(e) => { e.preventDefault(); sendMessage(); }} className="bg-[#00a884] w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg">✔</button>
            </div>
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
    </div>
  );
};

export default AstrologerChatPage;