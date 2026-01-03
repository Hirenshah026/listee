import { useEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

interface Message {
  _id: string;
  text: string;
  senderId: string;
  receiverId: string;
}

interface ChatUser {
  _id: string;
  name?: string;
  image?: string;
}

const AstrologerChatPage = () => {
  const { user } = useUser();
  const ASTRO_ID = user?._id;

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!ASTRO_ID) return;

    if (!socket.connected) socket.connect();
    socket.emit("join", ASTRO_ID);

    const onReceive = (msg: Message) => {
      if (!selectedUser) return;

      if (
        msg.senderId !== selectedUser._id &&
        msg.receiverId !== selectedUser._id
      )
        return;

      setMessages(prev =>
        prev.some(m => m._id === msg._id) ? prev : [...prev, msg]
      );
    };

    socket.on("receiveMessage", onReceive);

    return () => {
      socket.off("receiveMessage", onReceive);
    };
  }, [ASTRO_ID, selectedUser]);

  /* ================= LOAD CHAT USERS ================= */
  useEffect(() => {
    if (!ASTRO_ID) return;

    axios
      .get(`http://https://listee-backend.onrender.com:5000/api/messages/users/${ASTRO_ID}`)
      .then(res => setUsers(res.data.users || []))
      .catch(err => console.error("User list error:", err));
  }, [ASTRO_ID]);

  /* ================= OPEN CHAT ================= */
  const openChat = async (u: ChatUser, index: number) => {
    const fixedUser: ChatUser = {
      ...u,
      name: u.name || `User ${index + 1}`,
    };

    setSelectedUser(fixedUser);

    const res = await axios.get(
      `http://https://listee-backend.onrender.com:5000/api/messages/${ASTRO_ID}/${u._id}`
    );

    setMessages(res.data.messages || []);
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!input.trim() || !selectedUser || !ASTRO_ID) return;

    const res = await axios.post("http://https://listee-backend.onrender.com:5000/api/messages", {
      senderId: ASTRO_ID,
      receiverId: selectedUser._id,
      text: input,
    });

    const saved = res.data.message;

    setMessages(prev => [...prev, saved]);
    socket.emit("sendMessage", saved);
    setInput("");
  };

  return (
    <div className="max-w-sm mx-auto h-screen flex flex-col bg-gray-100">

      {/* ===== HEADER (ONLY USER LIST) ===== */}
      {!selectedUser && <Header />}

      {/* ===== USER LIST ===== */}
      {!selectedUser && (
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {users.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              No chats yet
            </p>
          )}

          {users.map((u, index) => (
            <div
              key={u._id}
              onClick={() => openChat(u, index)}
              className="bg-white p-3 rounded-lg shadow flex items-center gap-3 cursor-pointer"
            >
              <img
                src={u.image || "/banners/astrouser.jpg"}
                className="w-10 h-10 rounded-full"
              />
              <p className="font-medium">
                {u.name || `User ${index + 1}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ===== CHAT SCREEN ===== */}
      {selectedUser && (
        <div className="flex flex-col flex-1">

          {/* CHAT HEADER */}
          <div className="bg-yellow-400 px-4 py-3 flex items-center gap-3 shadow">
            <button
              onClick={() => setSelectedUser(null)}
              className="text-lg"
            >
              ⬅️
            </button>

            <img
              src={selectedUser.image || "/banners/astrouser.jpg"}
              className="w-9 h-9 rounded-full border"
            />

            <p className="font-semibold text-sm">
              {selectedUser.name}
            </p>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-3 bg-yellow-50">
            {messages.map(m => (
              <div
                key={m._id}
                className={`mb-2 flex ${
                  m.senderId === ASTRO_ID
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] ${
                    m.senderId === ASTRO_ID
                      ? "bg-yellow-400 rounded-br-none"
                      : "bg-white shadow rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="border-t bg-white p-2 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-full px-4 py-2"
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              className="bg-yellow-400 px-4 rounded-full font-medium"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      {!selectedUser && <BottomNav />}
    </div>
  );
};

export default AstrologerChatPage;
