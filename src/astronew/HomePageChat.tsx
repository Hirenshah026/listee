import React from 'react';

const ChatPage = () => {
  // Mock Data
  const experts = [
    { id: 1, name: "Acharya Vidya", exp: "12 yrs", rate: "25", status: "Online", rating: "4.9", category: "Vedic", chats: "4.5k" },
    { id: 2, name: "Astro Mehak", exp: "5 yrs", rate: "15", status: "Busy", rating: "4.7", category: "Tarot", chats: "2.1k" },
    { id: 3, name: "Pandit Rahul", exp: "20 yrs", rate: "40", status: "Online", rating: "5.0", category: "Palmistry", chats: "10k" },
    { id: 4, name: "Dr. Aarti", exp: "8 yrs", rate: "20", status: "Online", rating: "4.8", category: "Vastu", chats: "3.2k" },
  ];

  return (
    <div className="bg-gray-100 flex justify-center min-h-screen">
      {/* --- Same Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />

      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden">
        
        {/* --- Header (Same to Same Theme) --- */}
        <header className="bg-orange-600 px-5 pt-6 pb-6 rounded-b-[35px] sticky top-0 z-50 shadow-md">
          <div className="flex justify-between items-center text-white mb-5">
            <div className="flex items-center gap-4">
              {/* Back Arrow SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              <h1 className="text-xl font-extrabold tracking-tight">Chat with Astrologer</h1>
            </div>
            <div className="bg-orange-500/50 px-3 py-1.5 rounded-full border border-orange-400/30 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              <span className="text-xs font-bold">₹150</span>
            </div>
          </div>

          {/* --- Search Bar --- */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-200" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Search by name or specialty..." 
              className="w-full bg-orange-700/30 border border-orange-400/20 text-white placeholder-orange-200 pl-12 pr-4 py-3 rounded-2xl focus:outline-none"
            />
          </div>
        </header>

        <main className="px-4 py-6 space-y-5">
          
          {/* --- Filters --- */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button className="bg-orange-600 text-white px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap shadow-md">All Astrologers</button>
            <button className="bg-white text-slate-600 px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap border border-slate-200">Vedic</button>
            <button className="bg-white text-slate-600 px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap border border-slate-200">Tarot</button>
            <button className="bg-white text-slate-600 px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap border border-slate-200">Love</button>
          </div>

          {/* --- Astrologer Cards --- */}
          <div className="space-y-4">
            {experts.map((expert) => (
              <div key={expert.id} className="p-4 rounded-[28px] border border-slate-100 bg-white shadow-sm relative overflow-hidden">
                
                {/* Online/Busy Status */}
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase ${expert.status === 'Online' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                   ● {expert.status}
                </div>

                <div className="flex gap-4">
                  {/* Image with Rating */}
                  <div className="relative">
                    <img 
                      src={`https://i.pravatar.cc/150?u=${expert.id + 10}`} 
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-50" 
                      alt="Expert" 
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      ★ {expert.rating}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <h4 className="font-extrabold text-slate-800 text-sm">{expert.name}</h4>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold">{expert.category} • {expert.exp} exp</p>
                    <p className="text-orange-600 text-xs font-black mt-1">₹{expert.rate}<span className="text-[10px] opacity-60">/min</span></p>
                  </div>

                  {/* Chat Action */}
                  <div className="flex flex-col justify-center">
                    <button className={`px-5 py-2 rounded-xl text-[11px] font-black shadow-lg transition-all ${
                      expert.status === 'Online' 
                      ? 'bg-orange-600 text-white shadow-orange-100' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}>
                      {expert.status === 'Online' ? 'CHAT' : 'BUSY'}
                    </button>
                    <p className="text-[8px] text-slate-400 text-center mt-1 font-bold">{expert.chats} chats</p>
                  </div>
                </div>

                {/* Offer Line */}
                <div className="mt-3 pt-3 border-t border-dashed border-slate-100">
                   <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                     First 5 mins @ ₹1 offer applied
                   </p>
                </div>
              </div>
            ))}
          </div>

        </main>

        {/* --- Bottom Spacing for Nav --- */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};

export default ChatPage;