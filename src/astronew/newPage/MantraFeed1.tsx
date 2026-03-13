import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, BookOpen, Headphones, ChevronLeft } from 'lucide-react';
import Header from '../components/Header';
import BottomNavNew from '../components/BottomNavNew';

const API_BASE_URL = "https://listee-backend.onrender.com/api/mantras";

const MantraList = () => {
  const [mantras, setMantras] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}-all`);
        setMantras(res.data.data);
      } catch (err) {
        console.error("Error fetching mantras:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="bg-gray-100 flex justify-center min-h-screen">
      <div className="w-full max-w-[450px] bg-slate-50 min-h-screen shadow-2xl relative flex flex-col pb-24">
        <Header />
        
        <main className="px-4 mt-5 flex-1">
          {/* Back Arrow aur Title ka Section */}
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 bg-white rounded-full border border-slate-100 shadow-sm active:scale-90 transition-transform"
            >
              <ChevronLeft size={20} className="text-slate-800" />
            </button>
            <h2 className="text-xl font-black text-slate-800">Divine Mantras</h2>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400 font-bold">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {mantras.map((m) => (
                <Link to={`/mantra/${m._id}`} key={m._id} className="block">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.98] transition-transform">
                    <div className="relative h-28">
                      <img 
                        alt={m.title} 
                        className="w-full h-full object-cover" 
                        src={m?.image ? `https://listee-backend.onrender.com${m.image}` :  "https://t4.ftcdn.net/jpg/18/31/30/61/240_F_1831306129_HyhG4huBNMZ1FZ6R5WM95ay4PX51HNNc.jpg"} 
                      />
                      <button className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm">
                        <Heart size={12} className="text-[#F15A24]" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-[13px] line-clamp-1 text-slate-800">{m.title}</h4>
                      <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">{m.subtitle || "Divine Chant"}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                        <div className="flex gap-1.5 text-slate-400">
                          <BookOpen size={12} />
                          <Headphones size={12} className="text-[#F15A24]" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          {m.time || "5 min"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
        <BottomNavNew />
      </div>
    </div>
  );
};

export default MantraList;