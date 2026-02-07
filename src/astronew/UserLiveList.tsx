import React, { useEffect, useState } from "react";
import socket from "../components/chat/socket"; 
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { useNavigate } from "react-router-dom";
import { Radio, Sparkles, ChevronRight, Users } from "lucide-react";

const UserLiveList: React.FC = () => {
  const [liveAstros, setLiveAstros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get-live-astros");
    socket.on("live-astros-list", (list: any[]) => {
      setLiveAstros(list);
      setLoading(false);
    });
    return () => { socket.off("live-astros-list"); };
  }, []);

  return (
    <div className="flex justify-center bg-slate-200 h-[100dvh] w-full overflow-hidden font-sans">
      <div className="w-full max-w-[450px] bg-white flex flex-col h-full relative shadow-2xl">
        
        {/* --- Header --- */}
        <div className="flex-none z-50 bg-white">
          <Header />
          <div className="px-5 py-4 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Interactive Sessions</p>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Now</h2>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-slate-600 text-[10px] font-bold uppercase">{liveAstros.length} Online</span>
            </div>
          </div>
        </div>

        {/* --- Scrollable Content --- */}
        <main className="flex-1 overflow-y-auto bg-white px-4 pb-24 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full opacity-40">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : liveAstros.length > 0 ? (
            <div className="grid grid-cols-1 gap-3"> 
              {liveAstros.map((astro) => (
                <div 
                  key={astro._id} 
                  onClick={() => navigate(`/live-call/${astro._id}`)}
                  className="group relative bg-slate-50 border border-slate-100 p-3 rounded-[24px] flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:bg-indigo-50/50"
                >
                  {/* Left: Avatar with Pulse Effect */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 scale-110"></div>
                    <div className="relative w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden">
                      <img 
                        src={astro.image || "/banners/astrouser.jpg"} 
                        className="w-full h-full object-cover" 
                        alt={astro.name}
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase border-2 border-white">
                      Live
                    </div>
                  </div>

                  {/* Middle: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="font-bold text-slate-900 text-[15px] truncate uppercase tracking-tight">
                        {astro.name}
                      </h4>
                      <Sparkles size={12} className="text-amber-500 fill-amber-500" />
                    </div>
                    <p className="text-slate-500 text-[11px] font-medium truncate mb-1">
                      {astro.specialty || "Vedic Astrologer"}
                    </p>
                    <div className="flex items-center gap-3">
                       <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                         <Users size={10} /> 120+ joined
                       </span>
                    </div>
                  </div>

                  {/* Right: Action Icon */}
                  <div className="bg-white p-2 rounded-full shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                <Radio size={40} className="text-slate-300 mb-2" />
                <p className="text-slate-500 font-bold text-sm">No Active Sessions</p>
                <p className="text-slate-400 text-[10px]">Refresh to check again</p>
            </div>
          )}
        </main>

        <div className="flex-none">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default UserLiveList;