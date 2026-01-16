import { useEffect, useState } from "react";
import AstrologerCard from "./components/AstrologerCard";
import Header from "./components/Header";
import CategoryChips from "./components/CategoryChips";
import BottomNav from "./components/BottomNav";

const categories = ["NEW!", "Love", "Education", "Career"];

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

        const res = await fetch("http://10.184.233.180:5000/api/auth/astro/list");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load astrologers");
        }

        // ✅ change here if API key is different
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
    <div className="w-full md:max-w-sm max-w-sm mx-auto min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <CategoryChips
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="flex-1 p-3 space-y-3">
        {/* 🔄 Loader */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ❌ Error */}
        {error && (
          <div className="text-center text-red-600 text-sm bg-red-100 p-3 rounded">
            {error}
          </div>
        )}

        {/* 🚫 Empty */}
        {!loading && !error && filteredAstrologers.length === 0 && (
          <p className="text-center text-gray-500 text-sm">
            No astrologers found
          </p>
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

      <BottomNav />
    </div>
  );
};

export default AstrologerListPage;
