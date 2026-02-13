import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, ChevronDown, SortDesc, CheckCircle, 
  Star, MessageSquare, Phone, Bell, Sparkles, Award, SlidersHorizontal
} from 'lucide-react';
import BottomNav from "../components/BottomNavNew";

const API_URL = "https://listee-backend.onrender.com";

const AstrologerList = () => {
  const navigate = useNavigate();
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Data Fetching from API
  useEffect(() => {
    const fetchAstros = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/astro/list`);
        const data = await res.json();
        if (res.ok) setAstrologers(data.astro || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAstros();
  }, []);

  // Filter Logic (Search by Name)
  const filteredAstros = astrologers.filter(astro => 
    astro.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f8f7f5] dark:bg-[#1a140f] text-[#181411] dark:text-[#f5f2f0] min-h-screen max-w-[430px] mx-auto shadow-xl flex flex-col font-['Plus_Jakarta_Sans']">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1a140f]/95 backdrop-blur-md border-b border-gray-100 dark:border-stone-800">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h2 className="flex-1 text-center text-lg font-extrabold pr-10">Consult Top Experts</h2>
        </div>

        {/* Search Section */}
        <div className="px-4 pb-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a7560] group-focus-within:text-[#f27f0d] transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search by name (e.g. Ravi, Sharma)..."
              className="w-full bg-[#f5f2f0] dark:bg-[#2c2117] border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#f27f0d]/30 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Filter/Sort Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-[#1a140f] border-b dark:border-stone-800">
        <div className="flex items-center gap-2">
          <SortDesc size={18} className="text-[#f27f0d]" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Sort: Popular</span>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-bold bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg">
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {/* Main List Container */}
      <main className="flex-1 p-4 space-y-5 pb-28">
        {loading ? (
          // Skeleton Loader
          [1,2,3].map(i => <div key={i} className="h-64 bg-stone-200 dark:bg-stone-800 animate-pulse rounded-3xl" />)
        ) : filteredAstros.length > 0 ? (
          filteredAstros.map((astro) => (
            <AstrologerCard key={astro._id} astro={astro} />
          ))
        ) : (
          <div className="text-center py-20 opacity-50 font-bold">No Experts Found</div>
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

// --- Sub-component: Astrologer Card ---
const AstrologerCard = ({ astro }) => {
  const navigate = useNavigate();
  // Humari API mein status field na ho toh default online maan lete hain
  const isOnline = true; 

  const handleProfileClick = () => {
    navigate(`/user/view/astro`, { state: { astrologer: astro } });
  };

  const handleChatClick = (e) => {
    e.stopPropagation(); // Card click trigger na ho
    navigate("/user/astro/chat", { state: { astrologer: astro } });
  };

  return (
    <div 
      onClick={handleProfileClick}
      className="bg-white dark:bg-[#2c2117] rounded-[32px] overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img 
          src={astro.image || "banners/astrouser.jpg"} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          alt={astro.name}
        />
        {/* Status Tag */}
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-xl bg-white/90 dark:bg-black/80 backdrop-blur-md">
          <span className="size-2 bg-green-500 rounded-full animate-pulse" />
          <span className={isOnline ? "text-green-600" : "text-orange-500"}>ONLINE</span>
        </div>
        
        {/* Price Overlay */}
        <div className="absolute bottom-4 left-4 bg-[#f27f0d] text-white px-3 py-1 rounded-lg font-black text-sm">
          ₹{astro.price || '10'}/min
        </div>
      </div>

      {/* Info Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-black uppercase tracking-tight">{astro.name}</h3>
              <CheckCircle size={16} className="text-blue-500 fill-blue-500/10" />
            </div>
            <p className="text-[#8a7560] dark:text-stone-400 text-xs font-bold">
              {astro.skills?.split(',').slice(0, 2).join(', ') || 'Vedic Astrology'}
            </p>
          </div>
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-lg">
                <Star size={14} className="text-[#f27f0d] fill-[#f27f0d]" />
                <span className="font-black text-sm text-[#f27f0d]">{astro.rating || '4.8'}</span>
             </div>
             <span className="text-[10px] text-stone-400 mt-1 font-bold">2.5K+ Orders</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 py-3 border-t border-stone-50 dark:border-stone-800">
           <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
              <Award size={14} className="text-[#f27f0d]" />
              {astro.experience || '5'}+ Yrs Exp
           </div>
           <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
              <Sparkles size={14} className="text-[#f27f0d]" />
              Hindi, English
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
          <button 
            onClick={handleChatClick}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-[#f27f0d] text-[#f27f0d] font-bold text-sm hover:bg-orange-50 transition-colors"
          >
            <MessageSquare size={18} /> Chat
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#f27f0d] text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
            <Phone size={18} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default AstrologerList;