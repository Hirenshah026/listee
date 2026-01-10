import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import CallOverlay from "./CallOverlay"; // Naya component import kiya

interface Message {
  _id?: string;
  text: string;
  image?: string;
  senderId: string;
  receiverId: string;
  createdAt?: string;
}

interface ChatUser {
  _id: string;
  name?: string;
  image?: string;
  lastMessage?: string;
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
            {loading ? <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <div className="bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition-all"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg></div>}
          </div>
        </div>
      ) : (
        <div className="relative">
          <img src={src} alt="sent" className="w-full max-h-80 object-cover rounded-lg animate-in fade-in zoom-in duration-300" />
          <button onClick={saveToDevice} className="absolute top-2 right-2 bg-black/40 p-1.5 rounded-full text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 16.5l-5-5h3V4h4v7.5h3l-5 5zM5 18v2h14v-2H5z" /></svg></button>
        </div>
      )}
    </div>
  );
};

const AstrologerChatPage = () => {
  const { user } = useUser();
  const ASTRO_ID = user?._id;
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!ASTRO_ID) return;
    const fetchUsersData = async () => {
      try {
        const res = await axios.get(`http://10.18.209.180:5000/api/messages/users/${ASTRO_ID}`);
        const userList = res.data.users || [];
        const enriched = await Promise.all(userList.map(async (u: ChatUser, i: number) => {
          const name = u.name || `User ${i + 1}`;
          const lastRes = await axios.get(`http://10.18.209.180:5000/api/messages/last/${ASTRO_ID}/${u._id}`);
          return { ...u, name, lastMessage: lastRes.data?.text || (lastRes.data?.image ? "📷 Photo" : "No messages") };
        }));
        setUsers(enriched);
      } catch (err) { console.error(err); }
    };
    fetchUsersData();
  }, [ASTRO_ID]);

  useEffect(() => {
    if (!ASTRO_ID) return;
    if (!socket.connected) socket.connect();
    socket.emit("join", ASTRO_ID);
    socket.on("receiveMessage", (msg: Message) => {
      if (selectedUser && (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id)) {
        setMessages(prev => (msg._id && prev.some(m => m._id === msg._id) ? prev : [...prev, msg]));
      }
    });
    return () => { socket.off("receiveMessage"); };
  }, [ASTRO_ID, selectedUser]);

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || !selectedUser || !ASTRO_ID) return;
    const formData = new FormData();
    formData.append("senderId", ASTRO_ID); formData.append("receiverId", selectedUser._id); formData.append("text", input);
    if (selectedFile) formData.append("image", selectedFile);
    try {
      const res = await axios.post("http://10.18.209.180:5000/api/messages", formData);
      setMessages(prev => [...prev, res.data.message]);
      socket.emit("sendMessage", res.data.message);
      setInput(""); setSelectedFile(null); setImagePreview(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 flex justify-center bg-gray-200">
      <div className="w-full max-w-md h-full flex flex-col bg-white shadow-xl overflow-hidden relative">
        
        {/* --- CALL COMPONENT INTEGRATED --- */}
        <CallOverlay userId={ASTRO_ID} targetUser={selectedUser} />

        {!selectedUser ? (
          <>
            <Header />
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3 border-b text-yellow-600 font-bold">Recent Chats</div>
              {users.map(u => (
                <div key={u._id} onClick={() => { setSelectedUser(u); axios.get(`http://10.18.209.180:5000/api/messages/${ASTRO_ID}/${u._id}`).then(res => setMessages(res.data.messages || [])); }} className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50">
                  <img src={u.image || "/banners/astrouser.jpg"} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 truncate"><p className="font-bold text-gray-900">{u.name}</p><p className="text-sm text-gray-500 truncate">{u.lastMessage}</p></div>
                </div>
              ))}
            </div>
            <BottomNav />
          </>
        ) : (
          <div className="flex flex-col h-full bg-[#efeae2]">
            <header className="flex-none bg-yellow-400 p-3 flex items-center gap-3 shadow-md z-10 relative">
              <button onClick={() => setSelectedUser(null)} className="text-2xl font-bold p-1">←</button>
              <img src={selectedUser.image || "/banners/astrouser.jpg"} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <div className="flex-1 font-bold">{selectedUser.name}</div>
              {/* Call buttons are now automatically positioned by CallOverlay */}
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderId === ASTRO_ID ? "justify-end" : "justify-start"}`}>
                  <div className={`p-1.5 rounded-xl max-w-[85%] shadow-sm ${m.senderId === ASTRO_ID ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none border-l-4 border-yellow-400"}`}>
                    {m.image && <WhatsAppImage src={m.image} />}
                    {m.text && <p className="px-1 text-[14.5px] text-gray-800 break-words">{m.text}</p>}
                    <p className="text-[9px] text-gray-400 text-right px-1 mt-1">{new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} className="h-2" />
            </main>

            <footer className="p-2 bg-[#f0f2f5] flex items-center gap-2 border-t">
              <div className="flex-1 bg-white rounded-full px-4 py-1 flex items-center shadow-sm">
                <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 p-1 mr-1 rotate-45">📎</button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 bg-transparent outline-none py-2" />
              </div>
              <button onClick={sendMessage} className="bg-yellow-600 text-white w-11 h-11 rounded-full flex items-center justify-center">Send</button>
            </footer>
          </div>
        )}

        {imagePreview && (
          <div className="absolute inset-0 bg-black z-[100] flex flex-col">
            <header className="p-4 text-white flex justify-between items-center bg-black">
              <button onClick={() => { setImagePreview(null); setSelectedFile(null); }}>✕</button>
              <span>Send Image</span>
              <span></span>
            </header>
            <div className="flex-1 flex items-center justify-center bg-zinc-900"><img src={imagePreview} className="max-w-full max-h-[70vh] object-contain" /></div>
            <div className="p-4 bg-black flex flex-col gap-3">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Add a caption..." className="bg-zinc-800 text-white p-3 rounded-lg outline-none" />
              <div className="flex justify-end"><button onClick={sendMessage} className="bg-[#00a884] w-14 h-14 rounded-full flex items-center justify-center text-white">✔</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstrologerChatPage;