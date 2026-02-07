import React, { useEffect, useState } from "react";
import socket from "../components/chat/socket"; 
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

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
        <div className="flex-none z-50 bg-white border-b border-slate-100">
          <Header />
          <div className="px-4 py-3 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Live Astrologers</h2>
            <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-red-600 text-[10px] font-black uppercase tracking-tighter">{liveAstros.length} Live</span>
            </div>
          </div>
        </div>

        {/* --- Square Grid Content --- */}
        <main className="flex-1 overflow-y-auto p-2 pb-24 scrollbar-hide bg-slate-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : liveAstros.length > 0 ? (
            <div className="grid grid-cols-2 gap-2"> 
              {liveAstros.map((astro) => (
                <div 
                  key={astro._id} 
                  onClick={() => navigate(`/live-call/${astro._id}`)}
                  className="bg-white border border-slate-200 overflow-hidden active:opacity-80 transition-all cursor-pointer"
                >
                  {/* Square Image Container */}
                  <div className="relative aspect-square w-full">
                    <img 
                      src={astro.image || "/banners/astrouser.jpg"} 
                      className="w-full h-full object-cover" 
                      alt={astro.name}
                    />
                    {/* Specialty Label on top of image */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-[10px] font-bold truncate">
                            {astro.specialty || "Expert Astrologer"}
                        </p>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-2 flex flex-col gap-1">
                    <h4 className="font-black text-slate-800 text-[13px] truncate uppercase">
                      {astro.name}
                    </h4>
                    <button className="w-full bg-indigo-600 text-white py-1.5 text-[10px] font-black uppercase flex items-center justify-center gap-1">
                      Join Call <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 font-bold text-sm">
              No one is live right now.
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