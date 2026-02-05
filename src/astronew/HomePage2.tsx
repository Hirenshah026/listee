import React from 'react';
import { 
  ChevronRight, Play, Star, Sliders, MapPin, Clock, 
  Check, Youtube, Brain, GraduationCap
} from 'lucide-react';
import Header from './components/Header'; // Aapka naya sidebar wala header
import BottomNavNew from './components/BottomNavNew'; // Aapka naya bottom nav
import HomeSlider from "./components/HomeSlider";

const ListeeAstro = () => {
  return (
    <div className="bg-gray-100 flex justify-center min-h-screen">
      {/* Styles for Animations and Fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .live-ring { animation: ring-pulse 2s infinite; }
        @keyframes ring-pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}} />

      <div className="w-full max-w-[450px] bg-slate-50 min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden pb-32">
        
        {/* --- 1. HEADER (Integrated) --- */}
        <Header />

        <main className="px-4 mt-5 space-y-8 z-10">

          <section>
            <h3 className="text-lg font-bold text-gray-800">Popular</h3>
            <div className="p-2"><HomeSlider /></div>
          </section>
          {/* 2. HINDU CALENDAR */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Hindu Calendar</h3>
              <span className="text-orange-600 text-xs font-bold flex items-center cursor-pointer">
                Jan 2026 <ChevronRight size={14} className="ml-1" />
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-3">
                <div>
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Today's Tithi</p>
                  <h4 className="text-lg font-bold text-orange-800">Saptami (Shukla Paksha)</h4>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-amber-800 font-bold bg-amber-200/50 px-2 py-1 rounded-lg border border-amber-200">Abhijit: 12:11 PM</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Sunrise</p>
                  <p className="font-bold text-orange-600">07:12 AM</p>
                </div>
                <div className="h-8 w-px bg-amber-200"></div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Sunset</p>
                  <p className="font-bold text-orange-600">05:54 PM</p>
                </div>
                <div className="h-8 w-px bg-amber-200"></div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Nakshatra</p>
                  <p className="font-bold text-orange-600">Ashwini</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. LISTEN MANTRAS */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Listen Mantras</h3>
            <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex items-center">
              <div className="h-12 w-12 bg-orange-600 rounded-full flex items-center justify-center text-white mr-4 shadow-lg shadow-orange-100 cursor-pointer active:scale-90 transition-transform">
                <Play size={18} fill="white" className="ml-1" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm">Surya Mantra</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Sunday Special • 108 Reps</p>
              </div>
              <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-orange-600"></div>
              </div>
            </div>
          </section>

          {/* 4. LIVE NOW */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping"></span> Live Now
              </h3>
              <button className="text-orange-600 text-xs font-bold">View All</button>
            </div>
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2 px-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center flex-shrink-0 cursor-pointer">
                  <div className={`relative h-16 w-16 rounded-full border-2 p-1 ${i === 1 ? 'border-red-500 live-ring' : 'border-slate-200'}`}>
                    <img src={`https://i.pravatar.cc/150?u=${i}`} className="rounded-full w-full h-full object-cover" alt="Expert" />
                    {i === 1 && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-[8px] text-white px-2 py-0.5 rounded-md font-bold uppercase">Live</span>}
                  </div>
                  <p className="text-[10px] font-bold mt-2 text-slate-600">Expert {i}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. TOP EXPERTS */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-800 text-lg">Top Experts</h3>
              <span className="text-orange-600 text-xs font-bold flex items-center cursor-pointer">Filter <Sliders size={12} className="ml-1" /></span>
            </div>
            <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-green-100 text-green-600 text-[9px] px-3 py-1 font-bold rounded-bl-xl">Online</div>
              <img src="https://i.pravatar.cc/150?u=p1" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-50" alt="Expert" />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">Pandit K. Shashtri</h4>
                <p className="text-[10px] text-slate-400">Vedic • 15 yrs exp</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] font-bold">4.8</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="text-orange-600 leading-none">
                  <span className="text-lg font-black">₹10</span><span className="text-[9px] font-bold">/min</span>
                </div>
                <button className="bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-100 active:scale-95 transition-all">Chat</button>
              </div>
            </div>
          </section>

          {/* 6. OFFER CARD */}
          <section>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[35px] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 text-white">
                <p className="text-[10px] font-black uppercase bg-black/20 w-max px-3 py-1 rounded-full mb-3">Limited Offer</p>
                <h2 className="text-2xl font-black leading-tight mb-1">First 5 Min @ ₹1</h2>
                <p className="text-xs font-medium opacity-90 mb-4">Consult with verified Top Astrologers</p>
                <button className="bg-white text-orange-600 px-6 py-2 rounded-2xl text-xs font-bold shadow-lg active:scale-95 transition-all">Consult Now</button>
              </div>
              <img src="https://cdn-icons-png.flaticon.com/512/3306/3306631.png" className="absolute right-4 bottom-4 w-24 h-24 drop-shadow-2xl" alt="Offer" />
            </div>
          </section>

        </main>

        {/* --- 7. BOTTOM NAVIGATION (Integrated) --- */}
        <BottomNavNew />
      </div>
    </div>
  );
};

export default ListeeAstro;