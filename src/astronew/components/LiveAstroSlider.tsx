import React, { useEffect, useState } from 'react';
import socket from "../../components/chat/socket"; // Path sahi kar lena
import { useNavigate } from "react-router-dom";

const LiveAstroSlider = () => {
  const [liveAstros, setLiveAstros] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get-live-astros");
    socket.on("live-astros-list", (list: any[]) => {
      if (Array.isArray(list)) {
        setLiveAstros(list);
      }
    });
    return () => { socket.off("live-astros-list"); };
  }, []);

  if (liveAstros.length === 0) return null;

  return (
    <section>
      {/* Header with Title & View All */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping"></span> Live Now
        </h3>
        <button 
          onClick={() => navigate('/live-list')} 
          className="text-orange-600 text-xs font-bold"
        >
          View All
        </button>
      </div>

      {/* Horizontal Story UI */}
      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2 px-1">
        {liveAstros.map((astro) => (
          <div 
            key={astro?._id || Math.random()} 
            onClick={() => astro?._id && navigate(`/live-call/${astro._id}`)}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer"
          >
            {/* Circle Ring with Live Animation */}
            <div className="relative h-16 w-16 rounded-full border-2 p-1 border-red-500 live-ring">
              <img 
                src={astro?.image || "/banners/astrouser.jpg"} 
                className="rounded-full w-full h-full object-cover" 
                alt="Expert" 
              />
              {/* Absolute Live Badge */}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-[8px] text-white px-2 py-0.5 rounded-md font-bold uppercase whitespace-nowrap">
                Live
              </span>
            </div>

            {/* Name with Safety Split */}
            <p className="text-[10px] font-bold mt-2 text-slate-600 truncate w-16 text-center">
              {astro?.name ? astro.name.split(' ')[0] : "Expert"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveAstroSlider;