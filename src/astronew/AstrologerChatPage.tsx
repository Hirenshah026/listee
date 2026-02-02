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

// --- Skeleton Component ---
const UserSkeleton = () => (
  <div className="flex items-center gap-3 p-3 border-b animate-pulse bg-white">
    <div className="w-14 h-14 rounded-full bg-gray-200"></div>
    <div className="flex-1 space-y-2">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-3/4"></div>
    </div>
  </div>
);

// --- Helper: Date Formatting ---
const formatMessageDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.ceil((today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
};

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
    setLoadingUsers(true);
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
    } catch (err) { setInput(tempInput); }
  };

  return (
    <div className="fixed inset-0 flex justify-center bg-gray-200 overflow-hidden font-sans">
      <div className="w-full max-w-[450px] flex flex-col bg-white shadow-2xl relative overflow-hidden" style={{ height: 'var(--vh, 100vh)' }}>
        
        <CallOverlay ref={callRef} userId={ASTRO_ID} targetUser={selectedUser} />

        {!selectedUser ? (
          <>
            <Header />
            <div className="flex-1 overflow-y-auto pb-24 bg-white">
              <div className="px-4 py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-gray-50 border-b">Recent Chats</div>
              {loadingUsers ? [...Array(8)].map((_, i) => <UserSkeleton key={i} />) : users.map((u) => (
                <div key={u._id} onClick={() => {
                  setSelectedUser(u);
                  axios.get(`${API_URL}/api/messages/${ASTRO_ID}/${u._id}`).then(res => setMessages(res.data.messages || []));
                  axios.post(`${API_URL}/api/messages/mark-read`, { senderId: u._id, receiverId: ASTRO_ID });
                }} className="flex items-center gap-3 p-3 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer">
                  <img src={u.image || "/banners/astrouser.jpg"} className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-[15px] text-gray-800 truncate">
                        {u.name} {u.mobile ? <span className="text-[12px] font-normal text-gray-400">({u.mobile.slice(-4)})</span> : ""}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">{u.lastMessageTime !== "0" && new Date(u.lastMessageTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 truncate">{u.lastMessage}</p>
                      {u.unreadCount! > 0 && <span className="bg-[#25d366] text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">{u.unreadCount}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <BottomNavNew />
          </>
        ) : (
          <div className="flex flex-col h-full bg-[#efeae2]">
            {/* --- White Chat Header --- */}
            <header className="flex-none bg-white p-3 flex items-center gap-2 border-b z-50 shadow-sm">
              <button onClick={() => { setSelectedUser(null); setMessages([]); fetchUsersData(); }} className="p-1 text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
              </button>
              <div className="flex flex-1 items-center gap-3 cursor-pointer" onClick={() => setShowProfile(true)}>
                <img src={selectedUser.image || "/banners/astrouser.jpg"} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-[16px] leading-tight truncate">
                    {selectedUser.name} {selectedUser.mobile ? <span className="text-[12px] font-medium text-gray-400">({selectedUser.mobile.slice(-4)})</span> : ""}
                  </p>
                  <p className="text-[11px] text-green-600 font-bold uppercase tracking-wider">⏱️ {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <button onClick={() => callRef.current?.startCall('voice')} className="p-1 hover:text-gray-800">📞</button>
                <button onClick={() => callRef.current?.startCall('video')} className="p-1 hover:text-gray-800">📹</button>
              </div>
            </header>

            {/* --- Chat Content --- */}
            <main className="flex-1 overflow-y-auto p-3 space-y-1 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed">
              {messages.map((m, i) => {
                const isMe = m.senderId === ASTRO_ID;
                const showDate = i === 0 || formatMessageDate(messages[i-1].createdAt) !== formatMessageDate(m.createdAt);
                
                return (
                  <React.Fragment key={m._id || i}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="bg-[#e1f3fb] text-[#54656f] text-[11px] px-3 py-1 rounded-md shadow-sm uppercase font-semibold">
                          {formatMessageDate(m.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-[2px]`}>
                      <div className={`relative px-2 py-1.5 shadow-sm max-w-[85%] rounded-lg ${isMe ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none"}`}>
                        {m.image && <img src={m.image} className="max-h-60 rounded-md mb-1 w-full object-cover shadow-sm" />}
                        <div className="flex flex-wrap items-end justify-end gap-2 px-0.5">
                          {m.text && <p className="text-[14.5px] text-[#111b21] leading-tight break-words whitespace-pre-wrap">{m.text}</p>}
                          <div className="flex items-center gap-1 min-w-fit pt-1">
                            <p className="text-[10px] text-[#667781] uppercase">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
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

            {/* --- WhatsApp Input --- */}
            <form onSubmit={sendMessage} className="flex-none p-2 bg-[#f0f2f5] flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full flex items-center px-3 py-1 shadow-sm border border-gray-100">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 -rotate-45">📎</button>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message" className="flex-1 bg-transparent outline-none py-2 px-2 text-[15px]" onFocus={() => setTimeout(() => scrollToBottom("smooth"), 300)} />
              </div>
              <button type="submit" className="w-11 h-11 rounded-full flex items-center justify-center bg-[#00a884] text-white shadow-md active:scale-95 transition-transform">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="ml-1"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
              </button>
            </form>
          </div>
        )}

        {/* --- Profile Slide Up --- */}
        {showProfile && selectedUser && (
          <div className="absolute inset-0 bg-black/60 z-[100] flex items-end animate-in fade-in duration-200">
            <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="flex flex-col items-center mb-6">
                <img src={selectedUser.image || "/banners/astrouser.jpg"} className="w-24 h-24 rounded-full object-cover mb-3" />
                <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                <p className="text-gray-500 font-medium">{selectedUser.mobile || "User Profile"}</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"><span className="text-gray-500">Birth Date</span><span className="font-bold">{selectedUser.dob || "N/A"}</span></div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"><span className="text-gray-500">Birth Time</span><span className="font-bold">{selectedUser.tob || "N/A"}</span></div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"><span className="text-gray-500">Place of Birth</span><span className="font-bold text-right truncate ml-4">{selectedUser.pob || "N/A"}</span></div>
              </div>
              <button onClick={() => setShowProfile(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold active:scale-95 transition-all">CLOSE</button>
            </div>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) { setSelectedFile(f); setImagePreview(URL.createObjectURL(f)); }
      }} />

      {imagePreview && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col">
          <header className="p-4 text-white flex items-center justify-between bg-black/40">
            <button onClick={() => { setImagePreview(null); setSelectedFile(null); }} className="text-2xl p-2">✕</button>
            <span className="font-bold uppercase tracking-widest text-sm">Send Image</span>
            <div className="w-10"></div>
          </header>
          <div className="flex-1 flex items-center justify-center p-2"><img src={imagePreview} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl" /></div>
          <div className="p-6 pb-12 flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-white/10 border border-white/20 text-white p-4 rounded-2xl outline-none" placeholder="Add a caption..." />
            <button onClick={() => sendMessage()} className="bg-[#00a884] w-14 h-14 rounded-full text-white flex items-center justify-center shadow-xl">✔</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstrologerChatPage;