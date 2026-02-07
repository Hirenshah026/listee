import React, { useEffect, useState } from "react";
import socket from "../components/chat/socket"; 
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { useNavigate } from "react-router-dom";
import { Radio, Sparkles, ChevronRight } from "lucide-react";

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
        
        {/* --- Header & Live Bar --- */}
        <div className="flex-none z-50 bg-white shadow-sm">
          <Header />
          
          <div className="px-5 py-4 flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Live Now</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Astrologers</h2>
            </div>

            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-2xl shadow-sm flex items-center gap-2">
              <span className="text-slate-600 text-[11px] font-bold italic">
                {liveAstros.length} active
              </span>
            </div>
          </div>
        </div>

        {/* --- Scrollable Content --- */}
        <main className="flex-1 overflow-y-auto bg-slate-50 px-4 pt-2 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full gap-2 opacity-40">
              <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : liveAstros.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 pb-24"> 
              {liveAstros.map((astro) => (
                <div 
                  key={astro._id} 
                  onClick={() => navigate(`/live-call/${astro._id}`)}
                  className="bg-white rounded-[28px] border border-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] active:scale-95 transition-all cursor-pointer overflow-hidden flex flex-col items-center"
                >
                  {/* --- Image Section (MADE SMALLER) --- */}
                  <div className="relative mt-4 w-24 h-24"> 
                    <img 
                      src={astro.image || "/banners/astrouser.jpg"} 
                      className="w-full h-full object-cover rounded-full border-2 border-slate-100 shadow-sm" 
                      alt={astro.name}
                    />
                    {/* Live indicator on photo */}
                    <div className="absolute top-1 right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></div>
                  </div>

                  {/* --- Info Section --- */}
                  <div className="p-3 w-full text-center">
                    <h4 className="font-bold text-slate-800 text-[13px] truncate leading-tight">
                        {astro.name}
                    </h4>
                    <div className="flex items-center justify-center gap-1 opacity-80 mt-1">
                        <Sparkles size={8} className="text-yellow-500 fill-yellow-500" />
                        <p className="text-[9px] font-medium truncate uppercase tracking-tighter">
                            {astro.specialty || "Expert"}
                        </p>
                    </div>

                    {/* Join Button */}
                    <div className="mt-3">
                      <button className="w-full bg-slate-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 active:bg-black transition-colors">
                        Join <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
               <div className="bg-white p-6 rounded-full shadow-sm border border-slate-100 mb-4">
                  <Radio size={28} className="text-slate-200" />
               </div>
               <p className="text-slate-500 font-bold text-sm">No Live Sessions</p>
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