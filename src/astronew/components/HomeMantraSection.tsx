import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Play, Star, ChevronRight } from 'lucide-react';

const API_BASE_URL = "https://listee-backend.onrender.com/api/mantras";
// Aapki provide ki gayi image URL
const DEFAULT_IMG = "https://t4.ftcdn.net/jpg/18/31/30/61/240_F_1831306129_HyhG4huBNMZ1FZ6R5WM95ay4PX51HNNc.jpg";

const HomeMantraSection = () => {
  const [mantras, setMantras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMantras = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}-all`);
        setMantras(res.data.data.slice(0, 5));
      } catch (err) {
        console.error("Error fetching mantras:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMantras();
  }, []);

  if (loading) return <div className="px-4 py-4 text-xs text-slate-400">Loading divine sounds...</div>;

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-lg font-bold text-slate-800">Divine Mantras</h3>
        <Link to="/n9" className="text-[#F15A24] text-xs font-bold flex items-center">
          View All <ChevronRight size={14} />
        </Link>
      </div>

      {/*  */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
        {mantras.map((m) => (
          <Link 
            to={`/mantra/${m._id}`} 
            key={m._id} 
            className="flex-shrink-0 w-40 bg-white rounded-3xl p-3 border border-slate-100 shadow-sm transition-transform active:scale-95"
          >
            <div className="relative h-32 rounded-2xl overflow-hidden mb-3">
              <img 
                src={m.img || DEFAULT_IMG} 
                alt={m.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-white/30 backdrop-blur-md p-2 rounded-full">
                  <Play size={16} fill="white" className="text-white" />
                </div>
              </div>
            </div>
            <h4 className="font-bold text-sm text-slate-800 truncate">{m.title}</h4>
            <div className="flex items-center gap-1 mt-1">
              <Star size={10} className="fill-orange-400 text-orange-400" />
              <span className="text-[10px] text-slate-400 font-bold">4.9 • {m.category || 'Vedic'}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeMantraSection;