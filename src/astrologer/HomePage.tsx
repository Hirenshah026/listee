import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import HomeSlider from "./components/HomeSlider";

const categories = [
  { name: "Love", icon: "❤️" }, { name: "Career", icon: "💼" },
  { name: "Marriage", icon: "💍" }, { name: "Education", icon: "📚" },
  { name: "Health", icon: "🩺" }, { name: "Finance", icon: "💰" },
];

const HomePage = () => {
  return (
    <div className="flex justify-center bg-zinc-200 h-[100dvh] w-full overflow-hidden">
      <div className="w-full max-w-[450px] bg-white flex flex-col h-full relative shadow-2xl">
        
        {/* Header (Fix) */}
        <div className="flex-none z-50">
          <Header />
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50">
          <div className="p-3"><HomeSlider /></div>
          
          <div className="px-3 mt-1">
            <img src="/banners/ad4.jpg" className="rounded-2xl w-full shadow-sm" alt="ad" />
          </div>

          <div className="px-3 mt-6">
            <h3 className="font-bold text-gray-800 text-lg mb-3">Consult For</h3>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((c) => (
                <div key={c.name} className="bg-white rounded-2xl shadow-sm text-center py-4 border border-gray-100 active:scale-95 transition-all">
                  <div className="text-3xl mb-1">{c.icon}</div>
                  <p className="text-[12px] font-bold text-gray-700">{c.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-3 mt-6">
            <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl text-lg font-bold shadow-lg active:scale-95 transition-all">
              Talk to Astrologer Now
            </button>
          </div>

          <div className="px-3 mt-6 pb-6">
            <img src="/banners/ad1.jpg" className="rounded-2xl w-full opacity-80" alt="ad" />
          </div>
        </div>

        {/* Bottom Nav (Fix) */}
        <div className="flex-none">
          <BottomNav />
        </div>

      </div>
    </div>
  );
};

export default HomePage;