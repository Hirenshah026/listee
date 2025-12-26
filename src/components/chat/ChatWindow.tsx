import { useEffect, useRef, useState } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import useUser from "../../hooks/useUser";

type Message = {
  _id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  type?: "system";
};

type ChatUser = {
  _id: string;
  name: string;
  avatar?: string;
};

type Props = {
  user: ChatUser | null;
  onBack?: () => void;
};

const SESSION_DURATION = 2 * 60; // 2 minutes

export default function ChatWindow({ user, onBack }: Props) {
  const { user: loggedUser } = useUser();
  const CURRENT_USER_ID = loggedUser?._id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(SESSION_DURATION);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // =================== FETCH ALL QUESTIONS ONCE ===================
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/questions");
        const qs = Array.isArray(res.data.questions) ? res.data.questions : [];
        setQuestions(qs);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setQuestions([]);
      }
    };
    fetchQuestions();
  }, []);

  // =================== TIMER ===================
  const startTimer = () => {
    if (timerRef.current) return;

    const key = `chat_usage_${CURRENT_USER_ID}_${user?._id}_${new Date().toISOString().split("T")[0]}`;
    let usedSeconds = Number(localStorage.getItem(key) || 0);

    if (usedSeconds >= SESSION_DURATION) {
      setRemainingTime(0);
      return;
    }

    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const totalUsed = usedSeconds + elapsed;
      const remaining = SESSION_DURATION - totalUsed;
      setRemainingTime(remaining > 0 ? remaining : 0);

      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        localStorage.setItem(key, SESSION_DURATION.toString());
      } else {
        localStorage.setItem(key, totalUsed.toString());
      }
    }, 1000);
  };

  // =================== SEND MESSAGE WITH TYPING EFFECT ===================
  const handleSend = (text: string) => {
    if (!text.trim() || !user || !CURRENT_USER_ID) return;

    // Add user message
    const userMsg: Message = {
      _id: Date.now().toString(),
      text,
      senderId: CURRENT_USER_ID,
      receiverId: user._id,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Chatbot reply
    if (remainingTime > 0 && questionIndex < questions.length) {
      const q = questions[questionIndex];
      setQuestionIndex((prev) => prev + 1);

      // Add temporary "typing" message
      const botMsgId = "bot-" + Date.now();
      const typingMsg: Message = {
        _id: botMsgId,
        text: "Typing...",
        senderId: "bot",
        receiverId: CURRENT_USER_ID,
        createdAt: new Date().toISOString(),
        type: "system",
      };
      setMessages((prev) => [...prev, typingMsg]);

      // After delay, replace with full answer
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === botMsgId ? { ...m, text: q.answer } : m
          )
        );
      }, 1500); // 1.5 seconds delay
    } else if (remainingTime <= 0) {
      const botMsg: Message = {
        _id: "system-end",
        text: "⛔ Your free chat limit is over. Please recharge to continue.",
        senderId: "bot",
        receiverId: CURRENT_USER_ID,
        createdAt: new Date().toISOString(),
        type: "system",
      };
      setMessages((prev) => [...prev, botMsg]);
    }

    startTimer();
  };

  // =================== SCROLL ===================
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">Select a user to start chat</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]">
      {/* Header */}
      <div className="h-16 bg-white flex items-center px-4 shadow border-b justify-between">
        <div className="flex items-center gap-3">
          {onBack && <button onClick={onBack}>←</button>}
          <div className="font-medium">{user.name}</div>
        </div>
        <div className="text-sm text-gray-500">
          Time Left: {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, "0")}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m) => (
          <div key={m._id} className={`flex ${m.senderId === CURRENT_USER_ID ? "justify-end" : "justify-start"}`}>
            <MessageBubble text={m.text} own={m.senderId === CURRENT_USER_ID} chattime={m.createdAt} />
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-2">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
