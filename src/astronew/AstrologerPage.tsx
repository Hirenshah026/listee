import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react"; 
import AstrologerCard from "./components/AstrologerCard";
import Header from "./components/Header";
import CategoryChips from "./components/CategoryChips";
import BottomNavNew from "./components/BottomNavNew";

const categories = ["NEW!", "Love", "Education", "Career"];
const API_URL = "https://listee-backend.onrender.com";

const AstrologerListPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("NEW!");
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/auth/astro/list`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load");
        setAstrologers(data.astro || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAstrologers();
  }, []);

  const filteredAstrologers = astrologers.filter((astro) =>
    selectedCategory === "NEW!" ? true : astro.skills?.includes(selectedCategory)
  );

  return (
    <div className="min-h-screen bg-zinc-200 flex justify-center overflow-x-hidden">
      
      {/* 📱 Mobile Container (Isko relative rakha hai) */}
      <div className="w-full max-w-[450px] bg-slate-50 flex flex-col relative shadow-2xl min-h-screen">
        
        <Header />

        <div className="mt-2">
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        <div className="flex-1 p-4 space-y-4 pb-32 overflow-y-auto">
          {loading && (
             <div className="flex justify-center items-center h-40">
                <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
             </div>
          )}

          {!loading && !error && filteredAstrologers.map((astro) => (
            <div key={astro._id}>
              <AstrologerCard astrologer={astro} />
            </div>
          ))}
        </div>

        {/* 👇 YE RAHA FLOATING BUTTON - Container ke andar set kiya hai */}
        <div className="absolute bottom-24 right-5 z-50">
          <button
            onClick={() => navigate("/astro/my-chat")}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white flex items-center gap-2 px-5 py-3 rounded-full shadow-lg active:scale-95 transition-transform border-2 border-white"
          >
            <div className="relative">
              <MessageCircle size={20} fill="currentColor" className="opacity-90" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
            </div>
            <span className="font-bold text-xs uppercase tracking-tight">My Chat</span>
          </button>
        </div>

        <BottomNavNew />

      </div>
    </div>
  );
};

export default AstrologerListPage;