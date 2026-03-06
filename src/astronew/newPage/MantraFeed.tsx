import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNavNew';

const API_BASE_URL = "https://listee-backend.onrender.com/api/mantras"; // Sahi route rakho

const MantraFeed: React.FC = () => {
  const [mantras, setMantras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}-all`); // Backend mein /all route define karna
        setMantras(res.data.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return (
    <div className="bg-slate-100 flex justify-center min-h-screen">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl flex flex-col">
        
        {/* Header - Gradient & Aesthetic */}
        <header className="relative pt-16 pb-10 px-8 bg-gradient-to-br from-orange-600 to-orange-500 rounded-b-[45px] text-white shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <h2 className="text-2xl font-black tracking-tight">Divine Library</h2>
          <p className="text-[11px] font-bold text-orange-100 uppercase tracking-[0.2em] mt-1">Explore sacred vibrations</p>
        </header>

        {/* Content Feed */}
        <main className="p-6 flex-1 space-y-5">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
               <Loader2 size={32} className="animate-spin text-orange-500" />
               <p className="text-[10px] font-black uppercase tracking-widest">Loading Wisdom...</p>
             </div>
          ) : (
            mantras.map((m) => (
              <Link to={`/mantra/${m._id}`} key={m._id} className="block group">
                <div className="bg-slate-50 p-5 rounded-[28px] border border-slate-100 flex items-center justify-between group-hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:rotate-6 transition-transform">
                      <BookOpen size={22} className="text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{m.title}</h4>
                      <p className="text-[10px] font-bold text-orange-600/70 uppercase tracking-wide">By {m.astroName}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default MantraFeed;