import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { Astrologer } from "./types/astrologer";

const UserLiveList: React.FC = () => {
  const [liveAstros, setLiveAstros] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // API URL
  const API_URL = "https://listee-backend.onrender.com";

  useEffect(() => {
    const fetchAstros = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/auth/astro/list`);
        
        console.log("Full API Response:", res.data);

        // Aapka data "astro" key ke andar hai
        if (res.data.success && Array.isArray(res.data.astro)) {
          setLiveAstros(res.data.astro);
        } else {
          console.error("Data structure mismatch or success is false");
        }
      } catch (err) {
        console.error("Error fetching astros:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAstros();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-200 flex justify-center font-sans">
      {/* Laptop Centered Frame */}
      <div className="w-full max-w-[450px] bg-white shadow-2xl flex flex-col h-screen overflow-hidden relative border-x border-gray-300">
        <Header />
        
        <div className="bg-yellow-50 px-4 py-2 border-b flex justify-between items-center">
          <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest">
             ✨ Live Astrologers
          </p>
          <span className="bg-red-100 text-red-600 text-[9px] px-2 py-0.5 rounded-full font-bold">
            {liveAstros.length} Online
          </span>
        </div>

        <main className="flex-1 overflow-y-auto p-3 pb-24 bg-gray-50">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full gap-2">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Connecting...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {liveAstros.length > 0 ? (
                liveAstros.map((astro) => (
                  <div key={astro._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all active:scale-95">
                    
                    {/* Image Area */}
                    <div className="relative h-36 bg-zinc-100">
                      <img 
                        src={astro.image || "/banners/astrouser.jpg"} 
                        className="w-full h-full object-cover" 
                        alt={astro.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = "/banners/astrouser.jpg"; }} 
                      />
                      <div className="absolute top-2 left-2 bg-red-600 text-[8px] text-white px-2 py-0.5 rounded-full font-bold animate-pulse shadow-md">
                        LIVE
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-3 text-center flex-1 flex flex-col">
                      <h4 className="font-bold text-sm text-gray-800 capitalize truncate">
                        {astro.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 mb-2 truncate">
                        {astro.specialty || "Vedic Astrologer"}
                      </p>
                      
                      <div className="mt-auto">
                        <p className="text-xs font-bold text-gray-900 mb-2">₹{astro.rate ?? 10}/min</p>
                        <button 
                          onClick={() => window.location.href = `/live-call/${astro._id}`}
                          className="w-full bg-yellow-400 text-black py-2 rounded-xl text-[11px] font-bold shadow-sm active:bg-yellow-500 transition-colors"
                        >
                          Join & Talk
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-20">
                   <p className="text-gray-400 text-sm">No astrologers online right now.</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer Area */}
        <div className="absolute bottom-0 w-full bg-white border-t">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default UserLiveList;
