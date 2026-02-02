import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, AlertTriangle, Loader2 } from "lucide-react"; 
import useUser from "../hooks/useUser"; // Aapka custom hook
import AstrologerCard from "./components/AstrologerCard";
import Header from "./components/Header";
import CategoryChips from "./components/CategoryChips";
import BottomNavNew from "./components/BottomNavNew";

const categories = ["NEW!", "Love", "Education", "Career"];
const API_URL = "https://listee-backend.onrender.com";

const AstrologerListPage = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser(); // User ID ke liye
  const [selectedCategory, setSelectedCategory] = useState<string>("NEW!");
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ================= FETCH ASTROLOGERS LIST =================
  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/api/auth/astro/list`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load astrologers");
        }
        setAstrologers(data.astro || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchAstrologers();
  }, []);

  // ================= FILTER LOGIC =================
  const filteredAstrologers = astrologers.filter((astro) =>
    selectedCategory === "NEW!"
      ? true
      : astro.skills?.includes(selectedCategory)
  );

  return (
    <div className="min-h-screen bg-zinc-200 flex justify-center overflow-x-hidden font-sans">
      
      {/* 📱 Mobile Container - RELATIVE is important for absolute button */}
      <div className="w-full max-w-[450px] bg-slate-50 flex flex-col relative shadow-2xl min-h-screen">
        
        {/* --- Header --- */}
        <Header />

        {/* --- Categories --- */}
        <div className="mt-2">
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex-1 p-4 space-y-4 pb-32 overflow-y-auto">
          
          {/* 🔄 Loading State */}
          {(loading || userLoading) && (
            <div className="flex flex-col justify-center items-center h-80">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                Fetching Best Astrologers...
              </p>
            </div>
          )}

          {/* ❌ Error State */}
          {error && (
            <div className="text-center bg-red-50 p-6 rounded-[30px] border border-red-100 mx-2 shadow-sm">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <p className="font-bold text-red-800 text-sm">Connection Error</p>
              <p className="text-red-600 text-xs mt-1 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase"
              >
                Retry Now
              </button>
            </div>
          )}

          {/* ✅ Astrologer Cards List */}
          {!loading && !error && filteredAstrologers.map((astro) => (
            <div key={astro._id} className="transform active:scale-[0.98] transition-transform">
              <AstrologerCard astrologer={astro} />
            </div>
          ))}

          {/* 🚫 Empty State */}
          {!loading && !error && filteredAstrologers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 mx-2">
               <div className="text-5xl mb-4 opacity-20">🔭</div>
               <p className="text-slate-500 text-sm font-bold">No experts found</p>
            </div>
          )}
        </div>

        {/* 👇 FLOATING "MY CHAT" BUTTON - Fixed inside Container (Left Side) */}
        <div className="absolute bottom-24 left-5 z-50">
          <button
            onClick={() => navigate("/astro/chat")}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white flex items-center gap-3 px-6 py-3.5 rounded-full shadow-[0_10px_20px_rgba(234,88,12,0.3)] active:scale-95 transition-all border-2 border-white"
          >
            <div className="relative">
              <MessageCircle size={20} fill="currentColor" className="opacity-90" />
              {/* Notification Ping Animation */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
            </div>
            <span className="font-black text-xs uppercase tracking-tighter">My Chat</span>
          </button>
        </div>

        {/* --- Footer Navigation --- */}
        <BottomNavNew />

      </div>
    </div>
  );
};

export default AstrologerListPage;