import React from 'react';
import { PhoneCall, Star, Search, Wallet, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './components/BottomNavNew';

const CallPage = () => {
  const navigate = useNavigate();
  const experts = [
    { id: 1, name: "Acharya Sumit", exp: "15 yrs", rate: "30", status: "Online", rating: "4.9", wait: "2m" },
    { id: 2, name: "Astro Priya", exp: "7 yrs", rate: "20", status: "Busy", rating: "4.8", wait: "15m" },
  ];

  return (
    <div className="bg-gray-100 flex justify-center min-h-screen">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative flex flex-col pb-32">

        <header className="bg-orange-600 px-5 pt-6 pb-6 rounded-b-[35px] text-white">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-4">
              <ArrowLeft size={24} onClick={() => navigate(-1)} className='cursor-pointer'/>
              <h1 className="text-xl font-extrabold">Call Astrologer</h1>
            </div>
            <div className="bg-orange-500/50 px-3 py-1.5 rounded-full border border-orange-400/30 flex items-center gap-2">
              <Wallet size={14} />
              <span className="text-xs font-bold">₹150</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-200" size={18} />
            <input type="text" placeholder="Search Astrologers..." className="w-full bg-orange-700/30 border border-orange-400/20 text-white placeholder-orange-200 pl-12 pr-4 py-3 rounded-2xl focus:outline-none" />
          </div>
        </header>

        <main className="px-4 py-6 space-y-4">
          {experts.map((expert) => (
            <div key={expert.id} className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="relative">
                <img src={`https://i.pravatar.cc/150?u=${expert.id + 20}`} className="w-16 h-16 rounded-2xl object-cover" alt="Expert" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1">★ {expert.rating}</div>
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-slate-800 text-sm">{expert.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold">Vedic • {expert.exp}</p>
                <p className="text-orange-600 text-xs font-black mt-1">₹{expert.rate}/min</p>
                {expert.status === 'Busy' && <p className="text-[9px] text-red-500 font-bold mt-1">Wait: {expert.wait}</p>}
              </div>
              <button className={`p-3 rounded-full shadow-lg ${expert.status === 'Online' ? 'bg-green-500 text-white shadow-green-100' : 'bg-slate-200 text-slate-400'}`}>
                <PhoneCall size={20} />
              </button>
            </div>
          ))}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};
export default CallPage; // Ye line check karo, missing hogi