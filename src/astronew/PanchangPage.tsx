import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Calendar, Sun, Moon, 
  ArrowUpRight, ArrowDownRight, Info, Compass 
} from 'lucide-react';
import BottomNavNew from './components/BottomNavNew'; // Footer import kiya

const PanchangPage = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const panchangData = {
    tithi: "Saptami upto 08:35 PM",
    nakshatra: "Ashwini upto 10:20 PM",
    yoga: "Siddha upto 11:45 AM",
    karana: "Vanija upto 08:35 AM",
    rahuKaal: "10:30 AM - 12:00 PM",
    abhijit: "11:45 AM - 12:30 PM",
    sunrise: "07:12 AM",
    sunset: "05:54 PM",
    moonrise: "11:22 AM"
  };

  return (
    <div className="bg-slate-100 flex justify-center min-h-screen">
      <div className="w-full max-w-[450px] bg-white min-h-screen shadow-2xl relative flex flex-col pb-32">
        
        {/* --- Header Section (Height Fixed) --- */}
        <header className="bg-orange-600 px-5 pt-12 pb-24 rounded-b-[50px] relative overflow-hidden flex-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-10 blur-3xl"></div>
          <div className="flex items-center gap-4 text-white relative z-10">
            <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full backdrop-blur-md active:scale-90 transition-all">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-black tracking-tight">Dainik Panchang</h1>
          </div>
          
          {/* Date Selector Card - Position Adjusted */}
          <div className="absolute bottom-[-10px] left-5 right-5 bg-white rounded-[30px] p-5 shadow-xl border border-orange-100 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-600">
                  <Calendar size={22} />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-800 text-sm">Friday, 30 Jan</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Vikram Samvat 2082</p>
                </div>
              </div>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-md active:scale-95 transition-all">Change</button>
            </div>
          </div>
        </header>

        {/* --- Main Content (Scrolling properly) --- */}
        <main className="px-5 mt-10 space-y-6 overflow-y-auto">
          
          {/* Sunrise/Sunset - Grid Fixed */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50/70 p-4 rounded-[28px] border border-orange-100 flex items-center gap-3">
              <Sun size={20} className="text-orange-500" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Sunrise</p>
                <p className="text-xs font-black text-slate-800">{panchangData.sunrise}</p>
              </div>
            </div>
            <div className="bg-indigo-50/70 p-4 rounded-[28px] border border-indigo-100 flex items-center gap-3">
              <Moon size={20} className="text-indigo-500" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Moonrise</p>
                <p className="text-xs font-black text-slate-800">{panchangData.moonrise}</p>
              </div>
            </div>
          </div>

          {/* Detailed Panchang Card */}
          <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Info size={16} className="text-orange-600" /> Today's Details
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { label: "Tithi", value: panchangData.tithi, color: "text-orange-600" },
                { label: "Nakshatra", value: panchangData.nakshatra, color: "text-blue-600" },
                { label: "Yoga", value: panchangData.yoga, color: "text-green-600" },
                { label: "Karana", value: panchangData.karana, color: "text-purple-600" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                  <span className={`text-xs font-extrabold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Muhurat & Rahu Kaal */}
          <section className="space-y-3">
            <h3 className="font-extrabold text-slate-800 text-md px-1 flex items-center gap-2">
               <Compass size={18} className="text-orange-600" /> Muhurat Timings
            </h3>
            <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex justify-between items-center">
              <span className="font-bold text-green-900 text-xs">Abhijit Muhurat</span>
              <span className="text-xs font-black text-green-700">{panchangData.abhijit}</span>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex justify-between items-center">
              <span className="font-bold text-red-900 text-xs">Rahu Kaal</span>
              <span className="text-xs font-black text-red-700">{panchangData.rahuKaal}</span>
            </div>
          </section>

          {/* Expert Banner */}
          <div className="bg-orange-600 rounded-[30px] p-5 text-white flex justify-between items-center shadow-lg shadow-orange-100 mb-6">
            <div>
              <p className="font-bold text-sm">Need Help with Muhurat?</p>
              <p className="text-[10px] opacity-80">Consult our top Astrologers now</p>
            </div>
            <button onClick={() => navigate('/astro/list')} className="bg-white text-orange-600 px-4 py-2 rounded-xl text-[10px] font-extrabold">Chat Now</button>
          </div>

        </main>

        {/* --- Footer (Added) --- */}
        <BottomNavNew  />
      </div>
    </div>
  );
};

export default PanchangPage;