import React, { useEffect, useState } from "react";
import socket from "../components/chat/socket"; 
import Header from "./components/Header";
import BottomNav from "./components/BottomNavNew";
import { useNavigate } from "react-router-dom";
import { Play, Users, Star } from "lucide-react";

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
    <div className="flex justify-center bg-slate-100 h-[100dvh] w-full overflow-hidden font-sans">
      <div className="w-full max-w-[450px] bg-[#F8FAFC] flex flex-col h-full relative">
        
        {/* --- Premium Header --- */}
        <div className="flex-none z-50 bg-white/80 backdrop-blur-md sticky top-0">
          <Header />
          <div className="px-6 py-4 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-[900] text-slate-900 leading-none">Live</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mt-1">Sessions</p>
            </div>
            <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                   <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                 </div>
               ))}
               <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[8px] text-white font-bold">
                 +{liveAstros.length}
               </div>
            </div>
          </div>
        </div>

        {/* --- Modern Compact Grid --- */}
        <main className="flex-1 overflow-y-auto px-4 pb-28 scrollbar-hide">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : liveAstros.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pt-2"> 
              {liveAstros.map((astro) => (
                <div 
                  key={astro._id} 
                  onClick={() => navigate(`/live-call/${astro._id}`)}
                  className="relative aspect-[4/5] rounded-[24px] overflow-hidden group shadow-sm active:scale-95 transition-all duration-300"
                >
                  {/* Background Image - Full Cover */}
                  <img 
                    src={astro.image || "/banners/astrouser.jpg"} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    alt={astro.name}
                  />
                  
                  {/* Smart Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <div className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span> LIVE
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                    <Star size={8} className="fill-yellow-400 text-yellow-400" /> 4.9
                  </div>

                  {/* Bottom Info Section */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-bold text-[14px] leading-tight truncate drop-shadow-md">
                      {astro.name}
                    </h4>
                    <p className="text-white/70 text-[10px] font-medium truncate mb-2">
                      {astro.specialty || "Vedic Expert"}
                    </p>
                    
                    {/* Glassy Join Button */}
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1 px-2 group-hover:bg-white group-hover:text-black transition-all">
                       <span className="text-white group-hover:text-black text-[9px] font-bold uppercase tracking-tighter">Join Now</span>
                       <div className="bg-indigo-500 p-1 rounded-lg">
                         <Play size={10} className="text-white fill-white" />
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-300">
               <p className="font-bold text-sm">No Active Experts</p>
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