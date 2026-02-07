import React, { useEffect, useState } from "react";
import socket from "../components/chat/socket"; 
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, User } from "lucide-react";

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
      <div className="w-full max-w-[450px] bg-slate-50 flex flex-col h-full relative shadow-2xl">
        
        {/* --- Header --- */}
        <div className="flex-none z-50 bg-white shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
          <Header />
          <div className="px-5 py-4 flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest italic">Live Session</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Top Astrologers</h2>
            </div>
            <div className="bg-slate-900 px-3 py-1 rounded-full shadow-lg shadow-slate-200">
              <span className="text-white text-[10px] font-bold uppercase tracking-tighter">
                {liveAstros.length} Online
              </span>
            </div>
          </div>
        </div>

        {/* --- Best Compact Card Grid --- */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 scrollbar-hide">
          {loading ? (
            <div className="flex justify-center items-center h-full opacity-30">
              <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : liveAstros.length > 0 ? (
            <div className="grid grid-cols-2 gap-4"> 
              {liveAstros.map((astro) => (
                <div 
                  key={astro._id} 
                  onClick={() => navigate(`/live-call/${astro._id}`)}
                  className="bg-white rounded-[28px] p-2.5 border border-white shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  {/* --- Image Section: Modern Circle with Ring --- */}
                  <div className="relative flex justify-center mt-2 mb-3">
                    <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-200 via-red-400 to-indigo-500">
                      <div className="bg-white p-0.5 rounded-full">
                        <img 
                          src={astro.image || "/banners/astrouser.jpg"} 
                          className="w-20 h-20 rounded-full object-cover shadow-md" 
                          alt={astro.name}
                        />
                      </div>
                    </div>
                    {/* Tiny User Count Badge */}
                    <div className="absolute -bottom-1 bg-white border border-slate-100 shadow-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                       <User size={8} className="text-indigo-600" />
                       <span className="text-[8px] font-bold text-slate-700">1.2k</span>
                    </div>
                  </div>

                  {/* --- Info Section --- */}
                  <div className="text-center px-1">
                    <h4 className="font-extrabold text-slate-800 text-[13px] truncate tracking-tight">
                      {astro.name}
                    </h4>
                    <div className="flex items-center justify-center gap-1 mb-3">
                       <Sparkles size={8} className="text-amber-500 fill-amber-500" />
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                         {astro.specialty || "Vedic Expert"}
                       </span>
                    </div>

                    {/* --- Stylish Join Button --- */}
                    <button className="w-full bg-slate-900 text-white py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-1 shadow-md shadow-slate-200 active:bg-black transition-colors">
                      Join Call <ChevronRight size={12} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
               <p className="text-sm font-black text-slate-400 uppercase italic">Updating List...</p>
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