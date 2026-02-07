import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Sliders } from "lucide-react";

const API_URL = "https://listee-backend.onrender.com";

const TopExpertsSlider = () => {
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAstros = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/astro/list`);
        const data = await res.json();
        if (res.ok) setAstrologers(data.astro || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAstros();
  }, []);

  const handleChatClick = (astro: any) => {
    navigate("/astro/chat", {
      state: { astrologer: astro }
    });
  };

  if (loading || astrologers.length === 0) return null;

  return (
    <section >
      {/* Header */}
      <div className="flex justify-between items-center  mb-4">
        <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Top Experts</h3>
        <span className="text-orange-600 text-xs font-bold flex items-center cursor-pointer">
          Filter <Sliders size={12} className="ml-1" />
        </span>
      </div>

      {/* Horizontal Slider Wrapper */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar  pb-4">
        {astrologers.map((astro) => (
          <div 
            key={astro._id}
            // Card width fix for slider
            className="flex-shrink-0 w-[300px] bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden active:scale-[0.97] transition-all"
          >
            {/* Status Tag */}
            <div className="absolute top-0 right-0 bg-green-100 text-green-600 text-[8px] px-3 py-1 font-bold rounded-bl-xl uppercase tracking-tighter">
              Online
            </div>

            {/* Expert Image */}
            <img 
              src={astro.image || "banners/astrouser.jpg"} 
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-50" 
              alt={astro.name} 
            />

            {/* Info Section */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 text-sm truncate">{astro.name}</h4>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {astro.skills?.split(',')[0] || "Vedic"} • {astro.experience || "5"} yrs
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] font-black text-slate-700">{astro.rating || "4.8"}</span>
              </div>
            </div>

            {/* Pricing & Action */}
            <div className="text-right flex flex-col items-end gap-1.5">
              <div className="text-orange-600 leading-none">
                <span className="text-sm font-black">₹{astro.price || "10"}</span>
                <span className="text-[8px] font-bold">/min</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevents card click
                  handleChatClick(astro);
                }}
                className="bg-orange-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-bold shadow-lg shadow-orange-100 active:scale-90 transition-all"
              >
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
};

export default TopExpertsSlider;