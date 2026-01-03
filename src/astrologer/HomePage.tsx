import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import HomeSlider from "./components/HomeSlider";

const categories = [
  { name: "Love", icon: "❤️" },
  { name: "Career", icon: "💼" },
  { name: "Marriage", icon: "💍" },
  { name: "Education", icon: "📚" },
  { name: "Health", icon: "🩺" },
];

const HomePage = () => {
  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-100 flex flex-col">
      <Header />

      {/* 🔥 REAL SLIDER */}
      <div className="p-3">
        <HomeSlider />
      </div>

      {/* 🟡 AD BANNER */}

      <div className="px-3 mt-4">
        <img
          src="/banners/ad4.jpg"
          className="rounded-xl w-full"
          alt="ad"
        />
      </div>
      {/* 📂 CATEGORIES */}
      <div className="px-3 mt-4">
        <h3 className="font-semibold mb-2">Consult For</h3>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((c) => (
            <div
              key={c.name}
              className="bg-white rounded-xl shadow text-center py-4"
            >
              <div className="text-2xl">{c.icon}</div>
              <p className="text-sm mt-1">{c.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🟢 SECOND AD */}
      <div className="px-3 mt-4">
        <img
          src="/banners/ad3.jpg"
          className="rounded-xl w-full"
          alt="ad"
        />
      </div>

      {/* 🧠 POSTER / TRUST */}
      <div className="px-3 mt-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold mb-2">Why Choose Us?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✔ Verified Astrologers</li>
            <li>✔ Instant Call & Chat</li>
            <li>✔ 100% Privacy</li>
            <li>✔ Affordable Prices</li>
          </ul>
        </div>
      </div>

      <div className="px-3 mt-4">
        <img
          src="/banners/ad1.jpg"
          className="rounded-xl w-full"
          alt="ad"
        />
      </div>
      {/* 🚀 CALL TO ACTION */}
      <div className="px-3 mt-4 mb-20">
        <button className="w-full bg-purple-600 text-white py-3 rounded-xl text-lg font-semibold">
          Talk to Astrologer Now
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
