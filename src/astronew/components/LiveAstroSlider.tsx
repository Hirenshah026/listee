import React, { useEffect, useState } from 'react';
import socket from "../../components/chat/socket"; 
import { useNavigate } from "react-router-dom";

const API_URL = "https://listee-backend.onrender.com";

const LiveAstroSlider = () => {
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get-live-astros");
    socket.on("live-astros-list", (list: any[]) => {
      if (Array.isArray(list) && list.length > 0) {
        setAstrologers(list);
        setIsLiveMode(true);
      } else {
        fetchNormalAstros();
      }
    });

    const fetchNormalAstros = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/astro/list`);
        const data = await res.json();
        if (res.ok) {
          setAstrologers(data.astro || []);
          setIsLiveMode(false);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    return () => { socket.off("live-astros-list"); };
  }, []);

  if (astrologers.length === 0) return null;

  return (
    <section className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Live Now</h3>
        <button onClick={() => navigate('astro/live/user')} className="text-orange-600 text-xs font-bold">
          View All
        </button>
      </div>

      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2 px-1">
        {astrologers.map((astro) => (
          <div 
            key={astro?._id || Math.random()} 
            onClick={() => {
                if(isLiveMode) {
                    navigate(`/user/live-call/${astro._id}`);
                } else {
                    navigate("/user/astro/chat", { state: { astrologer: astro } });
                }
            }}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer"
          >
            <div className={`relative h-16 w-16 rounded-full border-2 p-1 transition-all ${isLiveMode ? 'border-red-500 live-ring' : 'border-slate-200 shadow-sm'}`}>
              <img 
                src={astro?.image || "/banners/astrouser.jpg"} 
                className="rounded-full w-full h-full object-cover" 
                alt="Expert" 
              />
              {isLiveMode && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-[8px] text-white px-2 py-0.5 rounded-md font-bold uppercase whitespace-nowrap shadow-sm">
                  Live
                </span>
              )}
            </div>

            {/* ✅ FIXED NAME LOGIC: Ab pura naam ayega or truncate hoga */}
            <p className="text-[10px] font-bold mt-2 text-slate-700 truncate w-[72px] text-center leading-[1.1]">
              {astro?.astroData?.name || astro?.name || "Expert"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveAstroSlider;