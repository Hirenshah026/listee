import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import Header from "./components/Header";
import CallOverlay from "./CallOverlay";
import BottomNavNew from "./components/BottomNavNew";

// --- Interfaces ---
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
  gender?: string;
  dob?: string;
  tob?: string;
  pob?: string;
}

// --- Helper: Date Formatting (Today, Yesterday, Date) ---
const formatMessageDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = today.getTime() - msgDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
};

// --- Sub-Components ---
const UserSkeleton = () => (
  <div className="flex items-center gap-3 p-3 border-b animate-pulse">
    <div className="w-14 h-14 rounded-full bg-gray-200"></div>
    <div className="flex-1 space-y-2">
      <div className="flex justify-between"><div className="h-4 bg-gray-200 rounded w-1/3"></div><div className="h-3 bg-gray-200 rounded w-1/6"></div></div>
      <div className="h-3 bg-gray-100 rounded w-3/4"></div>
    </div>
  </div>
);

const BlueTick = ({ isRead }: { isRead: boolean }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" className={isRead ? "text-[#53bdeb]" : "text-gray-400"}>
    <path fill="currentColor" d="M2.35 12.55l5.15 5.15 11.15-11.15 1.45 1.45-12.6 12.6-6.6-6.6 1.45-1.45zM15.45 6.55l-1.45-1.45-10.15 10.15 1.45 1.45 10.15-10.15z"></path>
  </svg>
);

const AstrologerChatPage = () => {
  const { user } = useUser();
  const ASTRO_ID = user?._id;
  const ASTRO_NAME = user?.name || "Astrologer";
  const callRef = useRef<any>(null);

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showProfile, setShowProfile] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const API_URL = "https://listee-backend.onrender.com";

  // Visual Viewport fix for Keyboard
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        document.documentElement.style.setProperty('--vh', `${window.visualViewport.height}px`);
        if (selectedUser) scrollToBottom("auto");
      }
    };
    window.visualViewport?.addEventListener("resize", handleResize);
    handleResize();
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, [selectedUser]);

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
          lastMessage: lastRes.data?.text || (lastRes.data?.image ? "📷 Photo" : "No messages"),
          lastMessageTime: lastRes.data?.createdAt || "0",
          unreadCount: lastRes.data?.unreadCount || 0
        };
      }));
      setUsers(enriched.sort((a, b) => new Date(b.lastMessageTime!).getTime() - new Date(a.lastMessageTime!).getTime()));
    } catch (err) { console.error(err); } finally { setLoadingUsers(false); }
  };

  useEffect(() => { fetchUsersData(); }, [ASTRO_ID]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!ASTRO_ID) return;
    if (!socket.connected) socket.connect();
    socket.emit("join", ASTRO_ID);

    const handleMessage = (msg: Message) => {
      if (selectedUser && (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id)) {
        setMessages((prev) => [...prev, msg]);
        axios.post(`${API_URL}/api/messages/mark-read`, { senderId: msg.senderId, receiverId: ASTRO_ID });
      } else {
        setUsers(prevUsers => {
          const updated = prevUsers.map(u => u._id === msg.senderId ? { ...u, unreadCount: (u.unreadCount || 0) + 1, lastMessage: msg.text || "📷 Photo", lastMessageTime: msg.createdAt } : u);
          return [...updated].sort((a, b) => new Date(b.lastMessageTime!).getTime() - new Date(a.lastMessageTime!).getTime());
        });
      }
    };

    socket.on("receiveMessage", handleMessage);
    if (selectedUser) {
      socket.emit("start-chat-timer", { userId: selectedUser._id, astroId: ASTRO_ID });
      socket.on("timer-update", (data) => setTimeLeft(data.timeLeft));
    }
    return () => { socket.off("receiveMessage", handleMessage); socket.off("timer-update"); };
  }, [ASTRO_ID, selectedUser]);

  useLayoutEffect(() => { scrollToBottom(messages.length <= 15 ? "auto" : "smooth"); }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedFile) || !selectedUser || !ASTRO_ID) return;

    const formData = new FormData();
    formData.append("senderId", ASTRO_ID);
    formData.append("receiverId", selectedUser._id);
    formData.append("text", input);
    if (selectedFile) formData.append("image", selectedFile);

    const tempInput = input;
    setInput(""); setSelectedFile(null); setImagePreview(null);
    inputRef.current?.focus();

    try {
      const res = await axios.post(`${API_URL}/api/messages`, formData);
      setMessages(prev => [...prev, res.data.message]);
      socket.emit("sendMessage", res.data.message);
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, lastMessage: tempInput || "📷 Photo", lastMessageTime: new Date().toISOString() } : u));
    } catch (err) { setInput(tempInput); }
  };

  return (
    <div className="fixed inset-0 flex justify-center bg-zinc-300 overflow-hidden">
      <div className="w-full max-w-[450px] flex flex-col bg-white shadow-2xl relative overflow-hidden" style={{ height: 'var(--vh, 100vh)' }}>
        
        <CallOverlay ref={callRef} userId={ASTRO_ID} targetUser={selectedUser} />

        {!selectedUser ? (
          <>
            <Header />
            <div className="flex-1 overflow-y-auto bg-white pb-28">
              <div className="px-4 py-3 border-b text-orange-600 font-bold bg-orange-50 sticky top-0 z-10 uppercase text-[10px] tracking-widest">Recent Chats</div>
              {loadingUsers ? [...Array(6)].map((_, i) => <UserSkeleton key={i} />) : users.map((u) => (
                <div key={u._id} onClick={() => {
                  setSelectedUser(u);
                  setUsers(prev => prev.map(user => user._id === u._id ? { ...user, unreadCount: 0 } : user));
                  axios.get(`${API_URL}/api/messages/${ASTRO_ID}/${u._id}`).then(res => setMessages(res.data.messages || []));
                  axios.post(`${API_URL}/api/messages/mark-read`, { senderId: u._id, receiverId: ASTRO_ID });
                }} className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors">
                  <img src={u.image || "/banners/astrouser.jpg"} className="w-14 h-14 rounded-full object-cover border-2 border-orange-100 shadow-sm" />
                  <div className="flex-1 truncate">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className={`text-[15px] ${u.unreadCount! > 0 ? "font-bold text-black" : "font-semibold text-gray-800"}`}>
                        {u.name} {u.mobile ? ` - ${u.mobile.slice(-4)}` : ""}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">{u.lastMessageTime !== "0" && new Date(u.lastMessageTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex justify-between items-center">
                       <p className={`text-[13px] truncate ${u.unreadCount! > 0 ? "text-gray-900 font-bold" : "text-gray-500"}`}>{u.lastMessage}</p>
                       {u.unreadCount! > 0 && <span className="bg-green-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">{u.unreadCount}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <BottomNavNew />
          </>
        ) : (
          <div className="flex flex-col h-full bg-[#fdf8f2]">
            {/* --- Chat Header (Mobile 4 digits added here) --- */}
            <header className="flex-none bg-gradient-to-r from-yellow-500 to-orange-500 p-3 flex items-center justify-between shadow-lg z-50 text-white">
              <div className="flex items-center gap-2">
                <button onClick={() => { setSelectedUser(null); setMessages([]); fetchUsersData(); }} className="text-2xl font-bold pr-1 hover:scale-110 active:scale-90 transition-all">←</button>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfile(true)}>
                  <img src={selectedUser.image || "/banners/astrouser.jpg"} className="w-10 h-10 rounded-full border-2 border-white/50 object-cover shadow-md" />
                  <div>
                    <p className="font-bold leading-none text-[15px]">
                      {selectedUser.name} {selectedUser.mobile ? <span className="text-[12px] opacity-90 font-medium">({selectedUser.mobile.slice(-4)})</span> : ""}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                       <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></span>
                       <p className="text-[10px] font-bold text-yellow-50 bg-black/10 px-2 py-0.5 rounded-full uppercase">⏱️ {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pr-1">
                <button onClick={() => callRef.current?.startCall('voice')} className="p-2 hover:bg-white/10 rounded-full transition-all">📞</button>
                <button onClick={() => callRef.current?.startCall('video')} className="p-2 text-xl hover:bg-white/10 rounded-full transition-all">📹</button>
              </div>
            </header>

            {/* --- Chat Body --- */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed">
              {messages.map((m, i) => {
                const isMe = m.senderId === ASTRO_ID;
                const showDate = i === 0 || formatMessageDate(messages[i-1].createdAt) !== formatMessageDate(m.createdAt);
                
                return (
                  <React.Fragment key={m._id || i}>
                    {showDate && (
                      <div className="flex justify-center my-6">
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-4 py-1.5 rounded-full shadow-sm uppercase tracking-widest border border-orange-200">
                          {formatMessageDate(m.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`p-2.5 rounded-2xl max-w-[85%] shadow-sm relative ${isMe ? "bg-[#fff4d6] rounded-tr-none border border-yellow-200" : "bg-white rounded-tl-none border border-gray-100"}`}>
                        <p className={`text-[9px] font-black mb-1 uppercase tracking-tighter ${isMe ? "text-orange-600 text-right" : "text-yellow-600 text-left"}`}>{isMe ? ASTRO_NAME : selectedUser.name}</p>
                        {m.image && <img src={m.image} className="max-h-64 rounded-xl mb-1.5 w-full object-cover border border-black/5" />}
                        <div className="flex flex-wrap items-end justify-end gap-1 px-1">
                          {m.text && <p className="text-[15px] text-gray-800 break-words whitespace-pre-wrap flex-1 min-w-[60px] leading-tight">{m.text}</p>}
                          <div className="flex items-center gap-1 min-w-fit">
                            <p className="text-[9px] text-gray-400 font-bold">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            {isMe && <BlueTick isRead={!!m.read} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={bottomRef} />
            </main>

            {/* --- Input --- */}
            <form onSubmit={sendMessage} className="flex-none p-3 pb-6 bg-white flex items-center gap-2 border-t z-50">
              <div className="flex-1 bg-gray-50 rounded-full flex items-center px-4 py-1 border border-gray-200 shadow-inner focus-within:bg-white focus-within:border-orange-300 transition-all">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xl text-orange-500 mr-2 rotate-45 hover:scale-110 active:scale-90 transition-transform">📎</button>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent outline-none py-3 text-[15px]" onFocus={() => setTimeout(() => scrollToBottom("smooth"), 300)} />
              </div>
              <button type="submit" className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-b from-orange-400 to-orange-600 text-white active:scale-90 hover:shadow-orange-200 transition-all">➤</button>
            </form>
          </div>
        )}

        {/* --- Profile Modal --- */}
        {showProfile && selectedUser && (
          <div className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 p-8 flex flex-col items-center text-white relative">
                <button onClick={() => setShowProfile(false)} className="absolute top-5 right-5 text-2xl font-bold opacity-80 hover:opacity-100">✕</button>
                <img src={selectedUser.image || "/banners/astrouser.jpg"} className="w-28 h-28 rounded-full border-4 border-white/40 shadow-xl object-cover mb-4" />
                <h2 className="text-2xl font-black">{selectedUser.name}</h2>
                <p className="text-orange-100 font-bold tracking-widest">{selectedUser.mobile || "CLIENT PROFILE"}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex flex-col items-center">
                    <p className="text-[10px] text-orange-400 font-black uppercase mb-1">Birth Date</p>
                    <p className="text-[15px] font-black text-gray-700">{selectedUser.dob || "N/A"}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex flex-col items-center">
                    <p className="text-[10px] text-orange-400 font-black uppercase mb-1">Birth Time</p>
                    <p className="text-[15px] font-black text-gray-700">{selectedUser.tob || "N/A"}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-2">Place of Birth</p>
                  <p className="text-[15px] font-bold text-gray-700 leading-tight">{selectedUser.pob || "Location not provided"}</p>
                </div>
                <button onClick={() => setShowProfile(false)} className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest">Close Details</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) { setSelectedFile(f); setImagePreview(URL.createObjectURL(f)); }
      }} />

      {/* --- Full Image Preview Modal --- */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col">
          <header className="p-4 text-white flex justify-between items-center bg-black/40 backdrop-blur-md">
            <button onClick={() => { setImagePreview(null); setSelectedFile(null); }} className="text-3xl p-2 font-light">✕</button>
            <span className="font-black tracking-widest uppercase text-sm">Send Photo</span>
            <div className="w-10"/>
          </header>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={imagePreview} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" />
          </div>
          <div className="p-6 pb-12 flex gap-3 bg-gradient-to-t from-black to-transparent">
            <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 text-white p-4 rounded-2xl outline-none placeholder:text-gray-400" placeholder="Add a caption..." />
            <button onClick={() => sendMessage()} className="bg-orange-500 w-14 h-14 rounded-full text-white text-2xl shadow-2xl active:scale-90 transition-all flex items-center justify-center">✔</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstrologerChatPage;