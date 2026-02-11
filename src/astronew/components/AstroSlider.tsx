import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const API_URL = "https://listee-backend.onrender.com";

const AstroSlider = () => {
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAstros = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/astro/list`);
        const data = await res.json();
        if (res.ok) setAstrologers(data.astro || []);
      } catch (err) {
        console.error("Slider fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAstros();
  }, []);

  const handleAstroClick = (astrologer: any) => {
    navigate("/user/astro/chat", {
      state: { astrologer } 
    });
  };

  if (loading || astrologers.length === 0) return null;

  return (
    <section className="py-6 bg-white overflow-hidden">
      {/* --- Section Header --- */}
      <div className="flex justify-between items-center px-6 mb-5">
        <div className="flex flex-col">
          <h3 className="text-lg font-[900] text-slate-900 tracking-tight leading-none">
            Top Experts
          </h3>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mt-1">Live Now</span>
        </div>
        <button 
          onClick={() => navigate("/astrologers")} 
          className="text-[10px] font-black text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-all"
        >
          VIEW ALL
        </button>
      </div>

      {/* --- Horizontal Scroll Container (Fixed Slide) --- */}
      <div 
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing px-6 pb-4 scroll-smooth"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch' // Force smooth swipe on iOS/Chrome
        }}
      >
        {astrologers.map((astro) => (
          <div 
            key={astro._id} 
            onClick={() => handleAstroClick(astro)}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer"
          >
            {/* --- Avatar Wrapper --- */}
            <div className="relative group">
              {/* Animated Ring (Pulse) */}
              <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-ping opacity-20"></div>
              
              {/* Main Avatar Border */}
              <div className="relative p-1 rounded-full bg-gradient-to-b from-orange-400 to-yellow-200 shadow-xl shadow-orange-100/50">
                <div className="bg-white p-[2px] rounded-full">
                  <div className="w-[68px] h-[68px] rounded-full overflow-hidden">
                    <img 
                      src={astro.image ?? "/banners/astrouser.jpg"} 
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110" 
                      alt={astro.name} 
                    />
                  </div>
                </div>
              </div>

              {/* Verified Badge (From HeroIcons) */}
              <div className="absolute -bottom-1 -right-0.5 shadow-lg">
                <CheckBadgeIcon className="w-6 h-6 text-green-500 bg-white rounded-full border-2 border-white" />
              </div>
            </div>

            {/* --- Info --- */}
            <div className="mt-3 text-center">
              <h4 className="text-[12px] font-bold text-slate-800 tracking-tight truncate w-20 leading-tight">
                {astro?.name ? astro.name.split(" ")[0] : "Expert"}
              </h4>
              
              <div className="flex items-center justify-center gap-1 mt-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                <Star size={8} className="fill-orange-400 text-orange-400" />
                <span className="text-[10px] font-black text-slate-600">
                  {astro.rating || "4.5"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Adding a Global Style for No Scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </section>
  );
};

export default AstroSlider;