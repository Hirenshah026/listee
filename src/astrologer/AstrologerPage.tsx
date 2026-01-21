import { useEffect, useState } from "react";
import AstrologerCard from "./components/AstrologerCard";
import Header from "./components/Header";
import CategoryChips from "./components/CategoryChips";
import BottomNav from "./components/BottomNav";

const categories = ["NEW!", "Love", "Education", "Career"];

// ✅ Global API URL
const API_URL = "aqua-goat-506711.hostingersite.com";

const AstrologerListPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("NEW!");
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

        // Backend response check
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

  // ================= UI =================
  return (
    /* Laptop view mein bhi isko mobile jaisa dikhane ke liye:
       - min-h-screen: poori height lega
       - flex justify-center: laptop par center rahega
       - bg-zinc-200: laptop screen ka background
    */
    <div className="min-h-screen bg-zinc-200 flex justify-center overflow-x-hidden">
      
      {/* Actual Mobile Container:
         - max-w-md (448px approx): Perfect mobile width
         - w-full: mobile par poora cover karega
         - bg-gray-100: App ka background
      */}
      <div className="w-full max-w-md bg-gray-100 flex flex-col relative shadow-2xl min-h-screen overflow-y-auto">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-50">
           <Header />
        </div>

        <CategoryChips
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <div className="flex-1 p-3 space-y-3 pb-24"> {/* pb-24 taaki BottomNav card ko na chhupaye */}
          
          {/* 🔄 Loader */}
          {loading && (
            <div className="flex flex-col justify-center items-center h-60">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-gray-500 text-sm animate-pulse">Loading Astrologers...</p>
            </div>
          )}

          {/* ❌ Error */}
          {error && (
            <div className="text-center text-red-600 text-sm bg-red-100 p-4 rounded-xl border border-red-200 mx-2">
              <p className="font-bold">Error Occurred</p>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded-full uppercase"
              >
                Retry
              </button>
            </div>
          )}

          {/* 🚫 Empty */}
          {!loading && !error && filteredAstrologers.length === 0 && (
            <div className="text-center py-10">
               <div className="text-4xl mb-2">🔍</div>
               <p className="text-gray-500 text-sm font-medium">
                 No astrologers found in {selectedCategory}
               </p>
            </div>
          )}

          {/* ✅ Astrologer Cards */}
          {!loading &&
            !error &&
            filteredAstrologers.map((astro) => (
              <AstrologerCard
                key={astro._id}
                astrologer={astro}
              />
            ))}
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="fixed bottom-0 w-full max-w-md z-50">
           <BottomNav />
        </div>

      </div>
    </div>
  );
};

export default AstrologerListPage;