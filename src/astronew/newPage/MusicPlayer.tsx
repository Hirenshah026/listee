import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Share2, Users, Star, Sparkles, Languages } from 'lucide-react';
import BottomNav from '../components/BottomNavNew';

const API_BASE_URL = "https://listee-backend.onrender.com/api/mantras";

const MantraPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mantra, setMantra] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sanskrit' | 'hindi' | 'english'>('sanskrit');
  const [loading, setLoading] = useState(true);

  const imageUrl = "https://t4.ftcdn.net/jpg/18/31/30/61/240_F_1831306129_HyhG4huBNMZ1FZ6R5WM95ay4PX51HNNc.jpg";

  useEffect(() => {
    const fetchMantra = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/${id}`);
        setMantra(res.data.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchMantra();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen font-bold">Loading...</div>;

  return (
    <div className="bg-gray-100 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative flex flex-col pb-32 shadow-2xl">
        
        <header className="bg-orange-600 px-6 pt-12 pb-24 rounded-b-[50px] relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex justify-between items-center text-white">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white/20 rounded-2xl active:scale-90"><ChevronLeft size={22} /></button>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-100/80">Daily Darshan</p>
              <h2 className="text-sm font-bold tracking-tight">{mantra?.title}</h2>
            </div>
            <button className="p-2.5 bg-white/20 rounded-2xl"><Share2 size={20} /></button>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-40"></div>
        </header>

        <main className="px-5 -mt-16 z-20 space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-36 h-36 bg-white rounded-[35px] p-2 shadow-2xl border border-white/50">
              <img src={imageUrl} className="w-full h-full object-cover rounded-[28px]" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={imageUrl} className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-100" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">{mantra?.astroName}</h4>
                <div className="flex items-center gap-3 mt-1.5">
                   <span className="text-[10px] font-bold text-slate-400">Verified Astrologer</span>
                </div>
              </div>
            </div>
            <button className="bg-orange-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-orange-100">FOLLOW</button>
          </div>

          {/* --- Tab Switcher --- */}
          <div className="space-y-4">
             <div className="flex bg-slate-200/70 p-1.5 rounded-2xl gap-1">
                {(['sanskrit', 'hindi', 'english'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                      activeTab === lang ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
             </div>

             {/* Dynamic Content based on Active Tab */}
             <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden min-h-[250px] flex items-center justify-center animate-in fade-in duration-300">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                <p className="text-slate-800 text-lg font-bold leading-loose text-center whitespace-pre-line">
                  {mantra?.content[activeTab] || "Content not available for this language."}
                </p>
             </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default MantraPage;