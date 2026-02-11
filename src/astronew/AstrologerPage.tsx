import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquareText, ChevronRight, Loader2 } from "lucide-react"; 
import useUser from "../hooks/useUser";
import AstrologerCard from "./components/AstrologerCard";
import Header from "./components/Header";
import CategoryChips from "./components/CategoryChips";
import BottomNavNew from "./components/BottomNavNew";

const categories = ["NEW!", "Love", "Education", "Career"];
const API_URL = "https://listee-backend.onrender.com";

const AstrologerListPage = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
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
    <div className="min-h-screen bg-zinc-200 flex justify-center overflow-x-hidden font-sans">
      <div className="w-full max-w-[450px] bg-slate-50 flex flex-col relative shadow-2xl min-h-screen">
        
        <Header />

        {/* 📥 NEW CHAT TAB SECTION */}
        <div className="px-4 mt-4">
          <div 
            onClick={() => navigate("/user/astro/my-chat")}
            className="group bg-gradient-to-r from-orange-500 to-orange-600 p-[1px] rounded-2xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="bg-white group-hover:bg-orange-50 rounded-[15px] p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                  <MessageSquareText size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">My Chat</h3>
                  <p className="text-[10px] text-slate-500 font-medium">View your recent chat history</p>
                </div>
              </div>
              <div className="bg-slate-100 p-1.5 rounded-full text-slate-400 group-hover:text-orange-500 transition-colors">
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mt-4">
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Astrologers List */}
        <div className="flex-1 p-4 space-y-4 pb-32 overflow-y-auto">
          {(loading || userLoading) && (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
          )}
          
          {!loading && !error && filteredAstrologers.map((astro) => (
            <AstrologerCard key={astro._id} astrologer={astro} />
          ))}
        </div>

        <BottomNavNew />
      </div>
    </div>
  );
};

export default AstrologerListPage;