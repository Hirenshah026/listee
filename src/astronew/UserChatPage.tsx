import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Navigation ke liye
import useUser from "../hooks/useUser"; 
import Header from "./components/Header";
import BottomNavNew from "./components/BottomNavNew";

const API_URL = "https://listee-backend.onrender.com";

const ChatListPage = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate(); 
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchChatList = async () => {
      if (userLoading || !user?._id) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/messages/usersby/find/${user._id}`);
        const data = await res.json();
        if (data.success) {
          setChatUsers(data.users || []);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChatList();
  }, [user?._id, userLoading]);

  // 👇 YE RAHA AAPKA ONCLICK LOGIC (State ke saath)
  const handleChatNavigation = (astrologer: any) => {
    navigate("/astro/chat", {
      state: { astrologer } // Poora object bhej rahe hain jaisa aapne bataya
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center overflow-x-hidden font-sans">
      <div className="w-full max-w-[450px] bg-white flex flex-col relative shadow-xl min-h-screen">
        
        <Header />

        <div className="px-6 py-5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Messages</h1>
          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mt-1">Your Conversations</p>
        </div>

        <div className="flex-1 overflow-y-auto pb-32 px-4 space-y-3">
          {(loading || userLoading) ? (
            <div className="flex flex-col justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chatUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 text-sm">No chats yet.</p>
            </div>
          ) : (
            chatUsers.map((astro) => (
              <div 
                key={astro._id} 
                // 👇 Click par handleChatNavigation call hoga
                onClick={() => handleChatNavigation(astro)}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.97]"
              >
                {/* Profile Avatar */}
                <div className="relative flex-shrink-0">
                  <img 
                    src={astro.image || "/banners/astrouser.jpg"} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-50"
                    alt={astro.name}
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-800 truncate text-[15px]">{astro.name}</h3>
                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-2">
                      {astro.lastMessageTime !== "0" 
                        ? new Date(astro.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : ""}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate pr-2 font-medium">
                      {astro.lastMessage || "Start a conversation..."}
                    </p>
                    
                    {/* Unread dot indicator (Optional but looks good) */}
                    {astro.lastMessageTime !== "0" && (
                       <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <BottomNavNew />
      </div>
    </div>
  );
};

export default ChatListPage;