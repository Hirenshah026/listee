import React from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Sun, 
  MessageSquare, 
  Bookmark, 
  PlayCircle, 
  AudioLines, 
  Home, 
  Users, 
  UserCircle,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const SpiritualProfile = () => {
  const recentConsultations = [
    { id: 1, name: "Acharya Rahul", service: "Vedic Astrology - 15 mins", type: "reconnect", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJgG7LV7E85DZVczQBuxyC2K7OB1ANIVZGezaR0j964FzjhajkHJew2d5dT8qUYk-4015KWrjIp5DzwQC3hSR-bGBHeApJtjUTjXuZzaAVSd_j0wzqm6AV0DGGltOKHDMpYalXBYfaPb2rnDJAItUoKkH43qUdiP_-Jex23UWgXOhgetPMtDpPeXbDfMzbWAu2H9zd55DPfbVIbR6-qe6LwM1cgkmagteB-S7H21F-4myO3Lto_LvHmPMBMH75uxs9UkiN0hTg7g4" },
    { id: 2, name: "Pandit Ji", service: "Chat History - Yesterday", type: "chat", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9xV82Gjt0exS1XAOd3_J7athpzIqbHrTNmljE8yMIpBTc-uQr0AlW9jcCIWy0dRpPSKmZgkp_P-HUbQFyJHBffQZEs3LcIPrzWc4kkEyj2aIzgjgVVdDIGQzyB7Q19UqirX1QzQO66UHsBenpQa0HTzV3ZqdQcH2uiRNpKB4y4Cbifx1OoMucJRrFo4ystVf874aAr6I4cwhVkzaz3aSxSrZAL8C6RXp2DXDQ_EL2RcfeOQXXjoIv4ZtAsDQzGHNYy-Zg7UjKmzg" }
  ];

  const bookmarkedKathas = [
    { id: 1, title: "Bhagwat Geeta Saar", duration: "12 mins read", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHSrpq5UN5GyvS29NC1qEIg0fx1bYUCFvvveXGqsExM0tlosVvUQx2qFScw5Oc3_iQfaZrZkFBDwSNbJejK8G4lsvS1pEra3OMQd8AOBSm_moClhHma2w9uI-Lr-u2N5AvIldQYM8mMS062ZkGIijz0GqHknpfbpFufglMMdTHVkNWglpcLKL2WFkaEb1yXtIOVxHKfcLxUw9kIt6b_wOoHV24ffYSrkKMbdIfR1Uj1EcnoqNKFvEE-7gIR_DIZbLJokoc5RiCwTU" },
    { id: 2, title: "Ramayan Katha", duration: "45 mins listen", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAT9TpYU-Hsiec6FgM5u5EKSKJAJfBx6UNMY2ypx-1ZZ993O6X7Hpal7SrEMeOcUQ-uacynvqp4KqykIRF8oWotO5iR7JgLJiC10nraxwfOQfQRd1baJ6djSKZp_xmT0lcbdR0noHt2ZiVEfNq-QAgzdSyQGuXyly37Ppw0b7Fog6xt_48ZW2fWKHx7jueRNXC847SG0DWfSXZ5unnZUVf2eeEMb4ZCOBwlNBE0F_1Jq8nQda_KW3fMR6B7qSCVtdAUyCWVyXStTeE" }
  ];

  return (
    <div className="bg-[#f8f7f5] dark:bg-[#221910] font-['Plus_Jakarta_Sans'] text-[#181411] dark:text-white min-h-screen pb-20 max-w-[480px] mx-auto shadow-2xl">
      
      {/* Top App Bar */}
      <header className="sticky top-0 z-20 flex items-center bg-white/80 dark:bg-[#221910]/80 backdrop-blur-md p-4 border-b border-gray-100 dark:border-gray-800">
        <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="flex-1 text-center text-lg font-bold">Spiritual Profile</h2>
        <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
          <Settings size={24} />
        </button>
      </header>

      {/* Wallet Section */}
      <section className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[#e6e0db] dark:border-[#4a3f35] bg-white dark:bg-[#2d241c] p-5 shadow-sm">
          <div>
            <p className="text-base font-bold">My Wallet</p>
            <p className="text-[#8a7560] dark:text-[#b5a392] text-base">Balance: ₹450.00</p>
          </div>
          <button className="w-full sm:w-auto px-6 py-2 bg-[#f27f0d] text-white text-sm font-bold rounded-lg shadow-md active:scale-95 transition-transform">
            Add Money
          </button>
        </div>
      </section>

      {/* Daily Horoscope Card */}
      <section className="px-4 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-[#f27f0d] rounded-xl p-5 text-white shadow-lg"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold">Daily Horoscope</h3>
              <p className="text-sm opacity-90">Rashi: Simha (Leo)</p>
            </div>
            <Sun size={36} className="text-white/80" />
          </div>
          <p className="text-sm leading-relaxed mb-4">
            Today is a day for spiritual growth. Focus on meditation and you will find clarity in your professional life.
          </p>
          <button className="bg-white/20 hover:bg-white/30 transition-colors rounded-lg py-2.5 px-4 text-xs font-bold w-full backdrop-blur-sm uppercase tracking-wider">
            Read Full Prediction
          </button>
        </motion.div>
      </section>

      {/* Recent Consultations */}
      <section className="py-2">
        <div className="flex items-center justify-between px-4 mb-2">
          <h3 className="text-lg font-bold">Recent Consultations</h3>
          <button className="text-[#f27f0d] text-sm font-bold flex items-center gap-1">
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="bg-white dark:bg-[#2d241c]">
          {recentConsultations.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <img src={item.img} alt={item.name} className="h-14 w-14 rounded-full border-2 border-orange-500/20 object-cover" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-[#8a7560] dark:text-[#b5a392] text-sm">{item.service}</p>
              </div>
              {item.type === 'reconnect' ? (
                <button className="px-4 py-1.5 rounded-lg border border-orange-500/20 text-[#f27f0d] text-sm font-bold bg-[#f8f7f5] dark:bg-[#4a3f35]">
                  Re-connect
                </button>
              ) : (
                <div className="p-2.5 bg-orange-500/10 text-[#f27f0d] rounded-full">
                  <MessageSquare size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bookmarked Kathas */}
      <section className="pt-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-lg font-bold">My Bookmarked Kathas</h3>
          <button className="text-[#f27f0d] text-sm font-bold">More</button>
        </div>
        <div className="flex overflow-x-auto gap-4 px-4 no-scrollbar pb-2">
          {bookmarkedKathas.map((katha) => (
            <div key={katha.id} className="min-w-[160px] group cursor-pointer">
              <div 
                className="h-24 w-full rounded-xl bg-cover bg-center relative mb-2 shadow-sm group-hover:shadow-md transition-shadow"
                style={{ backgroundImage: `url(${katha.img})` }}
              >
                <div className="absolute top-2 right-2 bg-white/95 rounded-full p-1.5 text-[#f27f0d] shadow-sm">
                  <Bookmark size={14} fill="currentColor" />
                </div>
              </div>
              <p className="text-sm font-bold line-clamp-1">{katha.title}</p>
              <p className="text-[#8a7560] dark:text-[#b5a392] text-xs">{katha.duration}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Saved Mantras */}
      <section className="px-4 pt-6 pb-20">
        <h3 className="text-lg font-bold mb-3">Saved Mantras</h3>
        <div className="space-y-3">
          <MantraItem title="Gayatri Mantra" subtitle="Powerful healing chant" />
          <MantraItem title="Om Namah Shivaya" subtitle="Inner peace meditation" />
        </div>
      </section>

      {/* Navigation */}
      <nav className="fixed bottom-0 w-full max-w-[480px] bg-white/90 dark:bg-[#221910]/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex justify-around py-3 px-2">
        <NavItem icon={<Home size={24} />} label="Home" />
        <NavItem icon={<Users size={24} />} label="Consult" />
        <NavItem icon={<UserCircle size={24} />} label="Profile" active />
      </nav>
    </div>
  );
};

// Helper Components
const MantraItem = ({ title, subtitle }) => (
  <div className="flex items-center gap-3 bg-white dark:bg-[#2d241c] p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 transition-colors cursor-pointer">
    <div className="bg-orange-500/10 text-[#f27f0d] p-2 rounded-lg">
      <AudioLines size={20} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-bold">{title}</p>
      <p className="text-[#8a7560] dark:text-[#b5a392] text-xs">{subtitle}</p>
    </div>
    <PlayCircle size={24} className="text-[#8a7560] dark:text-[#b5a392]" />
  </div>
);

const NavItem = ({ icon, label, active = false }) => (
  <button className={`flex flex-col items-center gap-1 flex-1 ${active ? 'text-[#f27f0d]' : 'text-gray-400 hover:text-gray-600'}`}>
    {icon}
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
  </button>
);

export default SpiritualProfile;