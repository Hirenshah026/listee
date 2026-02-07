import React, { useEffect, useState } from "react";
import socket from "../components/chat/socket"; 
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, PlayCircle } from "lucide-react";

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
        
        {/* --- Header Section --- */}
        <div className="flex-none z-50 bg-white">
          <Header />
          <div className="px-5 py-5 flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">Live Sessions</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Astrologers</h2>
            </div>

            <div className="bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="text-slate-600 text-[11px] font-bold">
                {liveAstros.length} Active
              </span>
            </div>
          </div>
        </div>

        {/* --- Grid Layout Main Content --- */}
        <main className="flex-1 overflow-y-auto px-4 pt-2 pb-28 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full gap-2 opacity-40">
              <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : liveAstros.length > 0 ? (
            <div className="grid grid-cols-2 gap-4"> 
              {liveAstros.map((astro) => (
                <div 
                  key={astro._id} 
                  onClick={() => navigate(`/live-call/${astro._id}`)}
                  className="group bg-white rounded-[32px] p-2 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] active:scale-95 transition-all cursor-pointer"
                >
                  {/* Photo Section */}
                  <div className="relative aspect-square mb-3">
                    <img 
                      src={astro.image || "/banners/astrouser.jpg"} 
                      className="w-full h-full object-cover rounded-[26px]" 
                      alt={astro.name}
                    />
                    {/* Floating Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors rounded-[26px] flex items-center justify-center">
                        <div className="bg-white/90 p-2 rounded-full scale-0 group-hover:scale-110 transition-transform">
                            <PlayCircle size={20} className="text-slate-900" />
                        </div>
                    </div>
                    {/* Specialty Tag */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-white shadow-sm">
                        <p className="text-[8px] font-black text-slate-800 uppercase tracking-tight truncate max-w-[60px]">
                            {astro.specialty || "Vedic"}
                        </p>
                    </div>
                  </div>

                  {/* Name & Info */}
                  <div className="px-1 pb-2">
                    <h4 className="font-extrabold text-slate-800 text-[13px] truncate text-center mb-2">
                      {astro.name}
                    </h4>
                    
                    <button className="w-full bg-slate-900 text-white py-2.5 rounded-[18px] text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 group-hover:bg-red-600 transition-colors">
                      Join <ChevronRight size={12} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-50">
               <Sparkles size={32} className="text-slate-300 mb-2" />
               <p className="text-slate-500 font-bold text-sm">No Live Experts</p>
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