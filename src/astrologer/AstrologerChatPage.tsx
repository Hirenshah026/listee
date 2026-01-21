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
  read?: boolean;
}

interface ChatUser {
  _id: string;
  name?: string;
  mobile?: string;
  image?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
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
  const ASTRO_NAME = user?.name || "Astrologer"; // Astro ka naam
  const callRef = useRef<any>(null);

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
  const API_URL = "https://aqua-goat-506711.hostingersite.com";

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
      const res = await axios.get(`${API_URL}/api/messages/users/${ASTRO_ID}`);
      const userList = res.data.users || [];
      const enriched = await Promise.all(userList.map(async (u: any) => {
        const lastRes = await axios.get(`${API_URL}/api/messages/last/${ASTRO_ID}/${u._id}`);
        return {
          ...u,
          name: u.name || `User`,
          mobile: u.mobile || "",
          lastMessage: lastRes.data?.text || (lastRes.data?.image ? "📷 Photo" : "No messages"),
          lastMessageTime: lastRes.data?.createdAt || "0",
          unreadCount: lastRes.data?.unreadCount || 0
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

  useEffect(() => {
    if (!ASTRO_ID) return;
    if (!socket.connected) socket.connect();
    socket.emit("join", ASTRO_ID);

    const handleMessage = (msg: Message) => {
      if (selectedUser && (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id)) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        axios.post(`${API_URL}/api/messages/mark-read`, { senderId: msg.senderId, receiverId: ASTRO_ID });
        socket.emit("messages-read", { senderId: msg.senderId, receiverId: ASTRO_ID });
      }
      fetchUsersData();
    };

    const handleReadStatus = ({ senderId, receiverId }: { senderId: string, receiverId: string }) => {
      if (selectedUser && receiverId === selectedUser._id) {
        setMessages(prev => prev.map(m => m.senderId === ASTRO_ID ? { ...m, read: true } : m));
      }
    };

    socket.on("receiveMessage", handleMessage);
    socket.on("messages-read-update", handleReadStatus);

    if (selectedUser) {
      socket.emit("start-chat-timer", { userId: selectedUser._id, astroId: ASTRO_ID });
      socket.on("timer-update", (data) => setTimeLeft(data.timeLeft));
      socket.on("timer-ended", () => setTimeLeft(0));
    }

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.off("messages-read-update", handleReadStatus);
      socket.off("timer-update");
      socket.off("timer-ended");
    };
  }, [ASTRO_ID, selectedUser]);

  useLayoutEffect(() => {
    scrollToBottom(messages.length <= 10 ? "auto" : "smooth");
  }, [messages]);

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || !selectedUser || !ASTRO_ID) return;
    const formData = new FormData();
    formData.append("senderId", ASTRO_ID);
    formData.append("receiverId", selectedUser._id);
    formData.append("text", input);
    if (selectedFile) formData.append("image", selectedFile);

    const tempInput = input;
    setInput(""); setSelectedFile(null); setImagePreview(null);
    try {
      const res = await axios.post(`${API_URL}/api/messages`, formData);
      const savedMsg = res.data.message;
      setMessages(prev => [...prev, savedMsg]);
      socket.emit("sendMessage", savedMsg);
      fetchUsersData();
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (err) { setInput(tempInput); }
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

        <CallOverlay ref={callRef} userId={ASTRO_ID} targetUser={selectedUser} />

        {!selectedUser ? (
          <>
            <Header />
            <div className="flex-1 overflow-y-auto bg-white pb-20">
              <div className="px-4 py-3 border-b text-yellow-600 font-bold bg-yellow-50 sticky top-0 z-10 uppercase text-[10px] tracking-widest">Recent Chats</div>
              {users.map((u) => (
                <div key={u._id} onClick={() => {
                  setSelectedUser(u);
                  axios.get(`${API_URL}/api/messages/${ASTRO_ID}/${u._id}`).then(res => setMessages(res.data.messages || []));
                  axios.post(`${API_URL}/api/messages/mark-read`, { senderId: u._id, receiverId: ASTRO_ID });
                  socket.emit("messages-read", { senderId: u._id, receiverId: ASTRO_ID });
                }} className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="relative">
                    <img src={u.image || "/banners/astrouser.jpg"} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" alt="user" />
                    {u.unreadCount! > 0 && <div className="absolute top-0 right-0 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className={`text-[15px] ${u.unreadCount! > 0 ? "font-bold text-black" : "font-semibold text-gray-800"}`}>
                        {u.name} {u.mobile ? `- ${u.mobile.slice(-4)}` : ""}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">
                        {u.lastMessageTime !== "0" && new Date(u.lastMessageTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-[13px] truncate flex-1 ${u.unreadCount! > 0 ? "text-gray-900 font-bold" : "text-gray-500"}`}>{u.lastMessage}</p>
                      {u.unreadCount! > 0 && (
                        <span className="bg-green-500 text-white text-[10px] font-bold h-5 min-w-[20px] rounded-full flex items-center justify-center px-1.5 ml-2">
                          {u.unreadCount}
                        </span>
                      )}
                    </div>
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
                <button onClick={() => { setSelectedUser(null); setMessages([]); fetchUsersData(); }} className="text-2xl font-bold pr-2 active:scale-90 transition-all">←</button>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfileModal(true)}>
                  <img src={selectedUser.image || "/banners/astrouser.jpg"} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="profile" />
                  <div>
                    <p className="font-bold leading-none text-[15px]">
                      {selectedUser.name} {selectedUser.mobile ? `- ${selectedUser.mobile.slice(-4)}` : ""}
                    </p>
                    <p className="text-[11px] font-bold text-orange-900 mt-1 uppercase tracking-tighter">⏱️ {formatTimer(timeLeft)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-5 pr-2">
                <button onClick={() => callRef.current?.startCall('voice')} className="text-xl active:scale-90 p-1">📞</button>
                <button onClick={() => callRef.current?.startCall('video')} className="text-2xl active:scale-90 p-1">📹</button>
              </div>
            </header>

            <main ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed relative">
              {messages.map((m, i) => {
                const showDate = i === 0 || getMessageDate(m.createdAt) !== getMessageDate(messages[i - 1].createdAt);
                const isMe = m.senderId === ASTRO_ID;
                return (
                  <React.Fragment key={i}>
                    {showDate && (
                      <div className="flex justify-center my-2">
                        <span className="bg-white/70 px-3 py-1 rounded text-[10px] font-bold text-gray-500 uppercase">{getMessageDate(m.createdAt)}</span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`p-1.5 rounded-xl max-w-[85%] shadow-sm relative ${isMe ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none border-l-4 border-yellow-400"}`}>

                        {/* Sender Name in Message Bubble */}
                        <p className={`text-[10px] font-bold mb-1 ${isMe ? "text-green-700 text-right" : "text-yellow-600 text-left"}`}>
                          {isMe ? ASTRO_NAME : selectedUser.name}
                        </p>

                        {m.image && <WhatsAppImage src={m.image} />}

                        <div className="flex flex-wrap items-end justify-end gap-2 px-1">
                          {m.text && <p className="text-[15px] text-gray-800 break-words whitespace-pre-wrap leading-snug flex-1 min-w-0">{m.text}</p>}
                          <div className="flex items-center shrink-0 mb-[-2px]">
                            {/* Time in AM/PM */}
                            <p className="text-[9px] text-gray-400 font-medium uppercase">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                            {isMe && (
                              <div className={`flex items-center ml-1 ${m.read ? "text-blue-500" : "text-gray-400"}`}>
                                <span className="text-[14px] font-bold leading-none">✓</span>
                                <span className="text-[14px] font-bold leading-none -ml-1.5">✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={bottomRef} />
              {showScrollBtn && (
                <button onPointerDown={(e) => { e.preventDefault(); scrollToBottom(); }} className="fixed bottom-24 right-5 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 z-[60] border active:scale-90 transition-all">↓</button>
              )}
            </main>

            <footer className="flex-none p-2 pb-5 bg-[#f0f2f5] flex items-center gap-2 border-t z-50">
              <div className="flex-1 bg-white rounded-3xl flex items-center px-3 py-1 border border-gray-200 shadow-sm">
                <button onPointerDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} className="text-xl text-gray-500 mr-2 rotate-45">📎</button>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 bg-transparent outline-none py-2 text-[15px]" />
              </div>
              <button onPointerDown={(e) => { e.preventDefault(); sendMessage(); }} className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-[#00a884] text-white active:scale-95 transition-all text-xl">➤</button>
            </footer>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); setImagePreview(URL.createObjectURL(f)); } }} />

      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black/90 z-[150] flex flex-col items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
          <img src={selectedUser.image || "/banners/astrouser.jpg"} className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-lg animate-in zoom-in duration-200" alt="large profile" />
          <p className="text-white mt-4 font-bold text-lg">{selectedUser.name}</p>
          <p className="text-gray-400 text-sm">{selectedUser.mobile}</p>
        </div>
      )}

      {imagePreview && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col">
          <header className="p-4 text-white flex justify-between items-center bg-black/50">
            <button onClick={() => { setImagePreview(null); setSelectedFile(null); }} className="text-2xl p-2">✕</button>
            <span className="font-bold text-sm uppercase tracking-widest">Send Photo</span>
            <div className="w-10" />
          </header>
          <div className="flex-1 flex items-center justify-center p-2 bg-zinc-900">
            <img src={imagePreview} className="max-w-full max-h-[70vh] object-contain" alt="preview" />
          </div>
          <div className="p-4 pb-10 flex gap-2 bg-black/60 backdrop-blur-md">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-zinc-800 text-white p-3 rounded-2xl outline-none border border-zinc-700" placeholder="Add a caption..." autoFocus />
            <button onPointerDown={(e) => { e.preventDefault(); sendMessage(); }} className="bg-[#00a884] w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg active:scale-90 transition-all">✔</button>
          </div>
        </div>
      )}
    </div>
  );
};


export default AstrologerChatPage;
