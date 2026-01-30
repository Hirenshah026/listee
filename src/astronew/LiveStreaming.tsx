import React, { useState } from 'react';
import { X, Users, MessageCircle, Gift, Phone, Send, Share2, Heart } from 'lucide-react';

const LiveStreaming = () => {
  const [messages] = useState([
    { id: 1, user: "Rahul", text: "Pranam Guru ji, meri job kab lagegi?" },
    { id: 2, user: "Sonal", text: "Guru ji vashikaran ke bare me bataye" },
    { id: 3, user: "Amit", text: "Joined the session" },
  ]);

  return (
    <div className="bg-black flex justify-center min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .glass-effect { background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px); }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}} />

      {/* Main Full Screen Container */}
      <div className="w-full max-w-md h-screen relative flex flex-col overflow-hidden bg-slate-900">
        
        {/* --- 1. Background Video (Placeholder Image) --- */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1515023115689-589c33041d3c?auto=format&fit=crop&w=500&q=80" 
            className="w-full h-full object-cover opacity-80"
            alt="Live Stream"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
        </div>

        {/* --- 2. Top Bar (Expert Info) --- */}
        <div className="absolute top-6 left-0 right-0 px-4 flex justify-between items-start z-20">
          <div className="flex items-center gap-2 glass-effect p-1.5 rounded-full border border-white/20">
            <img src="https://i.pravatar.cc/150?u=a1" className="w-10 h-10 rounded-full border-2 border-orange-500" alt="Astro" />
            <div className="pr-3">
              <h4 className="text-white text-[12px] font-bold leading-none">Acharya Om</h4>
              <p className="text-orange-400 text-[10px] font-bold flex items-center gap-1">
                <Users size={10} /> 1.2k Live
              </p>
            </div>
            <button className="bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">FOLLOW</button>
          </div>

          <div className="flex gap-2">
            <div className="glass-effect p-2 rounded-full border border-white/10 text-white">
              <Share2 size={18} />
            </div>
            <div className="glass-effect p-2 rounded-full border border-white/10 text-white cursor-pointer">
              <X size={18} />
            </div>
          </div>
        </div>

        {/* --- 3. Floating Comments Section --- */}
        <div className="absolute bottom-24 left-4 right-16 z-20 h-48 flex flex-col justify-end overflow-hidden">
          <div className="space-y-2 no-scrollbar">
            {messages.map((m) => (
              <div key={m.id} className="glass-effect px-3 py-1.5 rounded-2xl border border-white/5 w-fit max-w-full">
                <p className="text-xs">
                  <span className="text-orange-400 font-bold mr-1">{m.user}:</span>
                  <span className="text-white/90">{m.text}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- 4. Special User Call (Mini Box) --- */}
        <div className="absolute bottom-28 right-4 w-20 h-28 glass-effect rounded-2xl border-2 border-orange-500/50 overflow-hidden z-20 animate-float">
            <img src="https://i.pravatar.cc/150?u=user" className="w-full h-full object-cover" alt="User" />
            <div className="absolute bottom-0 inset-x-0 bg-orange-600 text-[8px] text-white text-center py-0.5 font-bold uppercase">On Call</div>
        </div>

        {/* --- 5. Bottom Actions Bar --- */}
        <div className="absolute bottom-6 left-0 right-0 px-4 flex items-center gap-3 z-30">
          {/* Chat Input */}
          <div className="flex-1 glass-effect rounded-full px-4 py-3 border border-white/20 flex items-center">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              className="bg-transparent border-none text-white text-sm placeholder-white/50 focus:outline-none w-full"
            />
            <Send size={18} className="text-orange-500" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <div className="h-12 w-12 bg-pink-600 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse border-2 border-pink-400 cursor-pointer">
              <Gift size={22} />
            </div>
            <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-green-400 cursor-pointer">
              <Phone size={22} />
            </div>
            <div className="h-12 w-12 glass-effect rounded-full flex items-center justify-center text-red-500 border border-white/20">
              <Heart size={22} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* --- Waiting List Counter --- */}
        <div className="absolute bottom-20 left-4 z-20">
          <p className="text-[10px] text-white/60 font-bold bg-black/20 px-2 py-1 rounded-md">
            Waiting: <span className="text-orange-500">12 Users</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LiveStreaming;