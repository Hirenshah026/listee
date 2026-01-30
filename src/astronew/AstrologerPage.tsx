import { useEffect, useState } from "react";
import AstrologerCard from "./components/AstrologerCard";
import Header from "./components/Header"; // Naya Premium Header
import CategoryChips from "./components/CategoryChips";
import BottomNavNew from "./components/BottomNavNew"; // Naya Premium Footer

const categories = ["NEW!", "Love", "Education", "Career"];
const API_URL = "https://listee-backend.onrender.com";

const AstrologerListPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("NEW!");
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const role = localStorage.getItem("role");

  // ================= FETCH ASTROLOGERS =================
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

  // ================= FILTER =================
  const filteredAstrologers = astrologers.filter((astro) =>
    selectedCategory === "NEW!"
      ? true
      : astro.skills?.includes(selectedCategory)
  );

  return (
    <div className="min-h-screen bg-zinc-200 flex justify-center overflow-x-hidden">
      
      {/* Actual Mobile Container */}
      <div className="w-full max-w-[450px] bg-slate-50 flex flex-col relative shadow-2xl min-h-screen">
        
        {/* --- Header Integration --- */}
        <Header />

        {/* Categories Section - Thoda padding top diya hai Header ke curves ke liye */}
        <div className="mt-2">
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        <div className="flex-1 p-4 space-y-4 pb-32 overflow-y-auto">
          
          {/* 🔄 Premium Orange Loader */}
          {loading && (
            <div className="flex flex-col justify-center items-center h-80">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                Finding Best Astrologers...
              </p>
            </div>
          )}

          {/* ❌ Error State */}
          {error && (
            <div className="text-center bg-red-50 p-6 rounded-[30px] border border-red-100 mx-2 shadow-sm">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="font-bold text-red-800 text-sm">Connection Error</p>
              <p className="text-red-600 text-xs mt-1 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase shadow-lg shadow-red-200"
              >
                Retry Now
              </button>
            </div>
          )}

          {/* 🚫 Empty State */}
          {!loading && !error && filteredAstrologers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 mx-2">
               <div className="text-5xl mb-4 opacity-20">🔭</div>
               <p className="text-slate-500 text-sm font-bold">
                 No experts found in <span className="text-orange-600">{selectedCategory}</span>
               </p>
               <p className="text-[10px] text-slate-400 mt-1">Try selecting another category</p>
            </div>
          )}

          {/* ✅ Astrologer Cards */}
          {!loading && !error && filteredAstrologers.map((astro) => (
            <div key={astro._id} className="transform active:scale-[0.98] transition-transform">
              <AstrologerCard astrologer={astro} />
            </div>
          ))}
        </div>

        {/* --- Footer Integration --- */}
        <BottomNavNew  />

      </div>
    </div>
  );
};

export default AstrologerListPage;