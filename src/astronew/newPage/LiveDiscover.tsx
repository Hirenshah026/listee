import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Briefcase, 
  Heart, 
  Banknote, 
  Church, 
  Radio, 
  Eye, 
  Clock, 
  Bell, 
  Home, 
  MessageSquare, 
  User 
} from 'lucide-react';

const LiveDiscover = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    { name: 'All', icon: null },
    { name: 'Career', icon: <Briefcase size={16} /> },
    { name: 'Love', icon: <Heart size={16} /> },
    { name: 'Wealth', icon: <Banknote size={16} /> },
    { name: 'Marriage', icon: <Church size={16} /> },
  ];

  const liveAstrologers = [
    { id: 1, name: "Acharya Sharma", expertise: "Vedic & Palmistry", viewers: "1.2k", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNV4spOGRH-q2vT2BMbv_v4Y-2JRJoTSAshxURmEDahoxl-rbzgw9a3FCOeNeJSSmjMPMf7MClCgVFvC6sE5wZsr8g7gMyTpx2nybo3uRe0jfYr9GCJlC0gUhTf6FXVfO-sTiHUEfU6ComuLq8WJAKPGAzbcmOkboNWRYBT0SqSpInIYHxQYlAGukF4Yb_qCfxNj53ywty77pvPbXHPSJF9HOKJ4e8z3OJW40P4Km8IfEX7mdP8k-mNuqb1m-_5AdZGx4qajKeuPg" },
    { id: 2, name: "Astrologer Aditi", expertise: "Tarot Card Specialist", viewers: "842", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhKIjXO9uhdoW7Yl91F1oshbjn4xyZCnOHXzOKiThKMKSxis8hYs_TR2JPjknIrOyVlZ9h5YnqHl5PBL_q9YGTEmplPVW_AWML2onufQgBRZ780aufSOTlmgYTf8Zb6EyIRXX2IbsguX6N6AaMsZupHVrcolHpOnR1CJwHFdk-sh0h1klsDzn2iQxj7MAy84kQSf9O_WNuy27LXbJPx-lh9iZvkNJ9FvC9qO9_mL7xvNXPRI_K5JXV-3ZlMJnbXLUH445OD5bOny4" },
    { id: 3, name: "Guru Ji Prasad", expertise: "Nadi Astrology Expert", viewers: "2.5k", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgVNUNqtEROwroEDNPyIYTRhnuy4MpFsV8elx-g6_nxM58YJeWGBAaWvVLoIZhGgXfUnjnF_D-2PyfjhhWufus008RmS0ckPJxebn-InRaCvTRvP3YlRqTMdAkcIj7X4j44mLrbFps83Gd4pzRUYxORlgbMpjTHHoGUl1ijrWUuedIwDizD41Wwg8sUU4hAwO6jHuqN9giUZ-JhxgfUokiHu1AThZ8xzMfrSy4rfEeUhZW8mrgmmGz99Gy1kVaxOZ7dI09LwHAoT0" },
    { id: 4, name: "Pandit Raj", expertise: "Numerology & Vaastu", viewers: "530", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOyJoC1mS7FeWDjUM_AbkOFUliO3O2cvHIXJlePA7wfMhQTF4wpzihAK3MlH1G3pb6uI2ewG2Uo7ZqFkNOwP2_cs1n59_of0GPiO9nx2H7KGlTCvaCWSRhlU59VoUAGeWS2ZcM9WnfnDqfOOcqaUNZJu1PPNpI09ynra9br7e41dmGUqw8rCyjkTXV8PfC-G-W-kkcSESfRiyXPNo-TEg6-F1f1-P8P-grvDb6Gz0a6cxtW7cYqW3b4s8kZe-PxT9hnhTW5biQdlo" },
  ];

  return (
    <div className="bg-[#f8f7f5] dark:bg-[#221910] font-['Plus_Jakarta_Sans'] text-[#181411] dark:text-[#f8f7f5] min-h-screen">
      <div className="relative flex flex-col w-full max-w-md mx-auto overflow-x-hidden">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white/80 dark:bg-[#221910]/80 backdrop-blur-md border-b border-[#f5f2f0] dark:border-[#3d2e1f]">
          <button className="flex items-center justify-center size-12 hover:bg-black/5 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold tracking-tight">Live Now Discover</h2>
          <button className="flex items-center justify-center size-12">
            <Search size={24} />
          </button>
        </header>

        {/* Category Chips */}
        <div className="flex gap-3 p-4 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl px-5 transition-all active:scale-95 ${
                activeCategory === cat.name 
                ? 'bg-[#f27f0d] text-white shadow-sm' 
                : 'bg-white dark:bg-[#3d2e1f] border border-[#e5e1de] dark:border-transparent'
              }`}
            >
              {cat.icon && <span className={activeCategory === cat.name ? 'text-white' : 'text-[#f27f0d]'}>{cat.icon}</span>}
              <p className="text-sm font-semibold">{cat.name}</p>
            </button>
          ))}
        </div>

        {/* Live Section Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-[22px] font-bold tracking-tight">Live Astrologers</h2>
          <div className="flex items-center gap-1.5 text-[#f27f0d] text-sm font-semibold">
            <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>86 Online</span>
          </div>
        </div>

        {/* Live Grid */}
        <div className="grid grid-cols-2 gap-4 p-4">
          {liveAstrologers.map((astro) => (
            <div key={astro.id} className="flex flex-col gap-2">
              <div 
                className="relative bg-cover bg-center flex flex-col justify-between p-3 aspect-[3/4] rounded-2xl overflow-hidden group shadow-lg"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%), url(${astro.img})` }}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Radio size={12} strokeWidth={3} /> LIVE
                  </div>
                  <div className="bg-black/40 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Eye size={12} /> {astro.viewers}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-white text-sm font-bold leading-tight">{astro.name}</p>
                  <p className="text-white/80 text-[10px]">{astro.expertise}</p>
                  <button className="mt-1 w-full bg-[#f27f0d] hover:bg-[#d66f0b] text-white text-xs font-bold py-2 rounded-lg transition-colors active:scale-95">
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Section */}
        <h2 className="text-[22px] font-bold tracking-tight px-4 pt-6 pb-3">Upcoming Live Sessions</h2>
        <div className="flex flex-col gap-3 px-4 pb-32">
          <UpcomingCard 
            name="Pandit Dev: Rahu Ketu Transit" 
            time="Today, 06:00 PM" 
            img="https://lh3.googleusercontent.com/aida-public/AB6AXuC0eT-iDW3hBwNSDQxesvIVjZyZ3bPfxbH5ToC4iaMMFbAbYAT2s9OC9xJFy_ATBBMkw65L_2gUWyQ0_d1KOJjN02yt7FHqGpHQXjPdPZ6sAmKJcxfQrg6Wi2BZrOYmDFBambTKHJ9F4yB7k6ocJi_guGBTQpBmotKTavBRyBt53PX3Lnrp43MREWcKGVth68s7eoiJ-eKTmh8NLfCMC06iLWiwHjWi2zLML1Z9FITVt_Kd4UFx9dFwJozdDPGD57P4YESLiz4pS8g" 
          />
          <UpcomingCard 
            name="Smt. Kavita: Soulmate Insights" 
            time="Tomorrow, 10:30 AM" 
            img="https://lh3.googleusercontent.com/aida-public/AB6AXuBT6GohJgfifRJ3nghCGeCoRAfxY9MOOA82zVG5YqY9zJShHAEM05NSw2ejTBeOHdxqlLmMnAS2_8tv7VYDTv26V-mrHo22waPAuxcRbP8VXDkady0-jzMjql4HY2SyEJJ_AisOyn4z_ayzlTsDWbXF34BySiXqXTcWky9C7_oFZRFhXzdlJ0DUzNujaI0gaOJVeQGP6Npuik_o8pXTxZOe-srkhVN-HVH3RKQehLKoSsBQtcpbIJOSldc-o8x5jcEkvBOH6vQuqlc" 
          />
        </div>

        {/* Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#221910]/90 backdrop-blur-xl border-t border-[#f5f2f0] dark:border-[#3d2e1f] px-6 py-3 pb-8 flex justify-between items-center z-50">
          <NavItem icon={<Home />} label="Home" />
          <NavItem icon={<Radio />} label="Live" active />
          <NavItem icon={<MessageSquare />} label="Chat" />
          <NavItem icon={<User />} label="Profile" />
        </nav>
      </div>
    </div>
  );
};

// Sub-components
const UpcomingCard = ({ name, time, img }) => (
  <div className="flex items-center gap-4 bg-white dark:bg-[#2d2116] p-3 rounded-xl border border-[#e5e1de] dark:border-[#3d2e1f] shadow-sm">
    <div className="size-16 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${img})` }}></div>
    <div className="flex-1 flex flex-col">
      <p className="font-bold text-sm">{name}</p>
      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mt-1">
        <Clock size={12} /> {time}
      </div>
    </div>
    <button className="bg-[#f27f0d]/10 text-[#f27f0d] hover:bg-[#f27f0d]/20 p-2 rounded-lg transition-colors">
      <Bell size={20} />
    </button>
  </div>
);

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${active ? 'text-[#f27f0d]' : 'text-gray-400'}`}>
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    <span className="text-[10px] font-bold">{label}</span>
  </div>
);

export default LiveDiscover;