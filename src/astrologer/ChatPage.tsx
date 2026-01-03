import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../components/chat/socket";
import useUser from "../hooks/useUser";

interface Message {
  _id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt?: string;
}

const FREE_CHAT_DURATION = 2 * 60 * 1000; // 2 min

const ChatPage = () => {
  const { user } = useUser();
  const CURRENT_USER_ID = user?._id;

  const location = useLocation();
  const navigate = useNavigate();
  const astrologer = location.state?.astrologer;
  const ASTRO_ID = astrologer?._id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [freeChatActive, setFreeChatActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(FREE_CHAT_DURATION);

  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= FREE CHAT TIMER (UI ONLY) ================= */
  useEffect(() => {
    if (!CURRENT_USER_ID || !ASTRO_ID) return;

    const key = `freeChat_${CURRENT_USER_ID}_${ASTRO_ID}`;
    const start =
      Number(localStorage.getItem(key)) || Date.now();

    localStorage.setItem(key, start.toString());

    const tick = () => {
      const remain =
        FREE_CHAT_DURATION - (Date.now() - start);

      if (remain <= 0) {
        setFreeChatActive(false);
        setTimeLeft(0);
        localStorage.removeItem(key);
      } else {
        setTimeLeft(remain);
        timerRef.current = window.setTimeout(tick, 1000);
      }
    };

    tick();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [CURRENT_USER_ID, ASTRO_ID]);

  /* ================= LOAD CHAT ================= */
  useEffect(() => {
    if (!CURRENT_USER_ID || !ASTRO_ID) return;

    axios
      .get(
        `https://listee-backend.onrender.com/api/messages/${CURRENT_USER_ID}/${ASTRO_ID}`
      )
      .then(res => setMessages(res.data.messages || []))
      .catch(() => { });
  }, [CURRENT_USER_ID, ASTRO_ID]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!CURRENT_USER_ID) return;

    if (!socket.connected) socket.connect();
    socket.emit("join", CURRENT_USER_ID);

    const onReceive = (msg: Message) => {
      if (
        msg.senderId !== ASTRO_ID &&
        msg.receiverId !== ASTRO_ID
      )
        return;

      setMessages(prev =>
        prev.some(m => m._id === msg._id)
          ? prev
          : [...prev, msg]
      );
    };

    socket.on("receiveMessage", onReceive);

    return () => {
      socket.off("receiveMessage", onReceive);
    };
  }, [CURRENT_USER_ID, ASTRO_ID]);

  /* ================= SEND MESSAGE (SAFE) ================= */
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!CURRENT_USER_ID || !ASTRO_ID) return;

    if (!freeChatActive) {
      alert("Free chat ended. Please recharge.");
      return;
    }

    const res = await axios.post(
      "https://listee-backend.onrender.com/api/messages",
      {
        senderId: CURRENT_USER_ID,
        receiverId: ASTRO_ID,
        text: input,
      }
    );

    const saved = res.data.message;

    setMessages(prev => [...prev, saved]);
    socket.emit("sendMessage", saved);
    setInput("");
  };

  if (!astrologer) {
    return <div className="p-4">No astrologer selected</div>;
  }

  const formatDateLabel = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="w-full md:max-w-sm md:mx-auto h-screen flex flex-col bg-gray-100">


      {/* HEADER */}
      <div className="bg-yellow-400 px-4 py-3 flex items-center gap-3 shadow">
        <button onClick={() => navigate(-1)}>⬅️</button>
        <img
          src={astrologer.image || "/banners/astrouser.jpg"}
          className="w-9 h-9 rounded-full"
        />
        <div>
          <p className="font-semibold text-sm">
            {astrologer.name}
          </p>
          <p className="text-xs text-green-700">
            {freeChatActive
              ? `Free chat: ${Math.ceil(timeLeft / 1000)}s`
              : "Chat ended"}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-3 bg-yellow-50">
        {messages.map((m, i) => {
          const showDate =
            i === 0 ||
            formatDateLabel(messages[i - 1].createdAt) !==
            formatDateLabel(m.createdAt);

          return (
            <div key={m._id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="bg-white/80 text-[10px] px-3 py-1 rounded-full shadow text-gray-500 font-semibold">
                    {formatDateLabel(m.createdAt)}
                  </span>
                </div>
              )}

              <div
                className={`mb-2 flex ${m.senderId === CURRENT_USER_ID
                    ? "justify-end"
                    : "justify-start"
                  }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${m.senderId === CURRENT_USER_ID
                      ? "bg-yellow-400 rounded-br-none"
                      : "bg-white shadow rounded-bl-none"
                    }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t bg-white p-2 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          disabled={!freeChatActive}
          className="flex-1 border rounded-full px-4 py-2"
          placeholder={
            freeChatActive
              ? "Type your message..."
              : "Chat ended"
          }
        />
        <button
          onClick={sendMessage}
          disabled={!freeChatActive}
          className={`px-4 rounded-full font-medium ${freeChatActive
              ? "bg-yellow-400"
              : "bg-gray-300 text-gray-500"
            }`}
        >
          Send
        </button>
      </div>

    </div>
  );
};

export default ChatPage;
