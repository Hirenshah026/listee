import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Wallet, BadgeCheck, Star, MessageSquare, Phone, PlayCircle 
} from 'lucide-react';
import BottomNav from "./components/BottomNavNew";

const AstrologerProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  // Slider se bhej gaya data receive karna
  const astroData = location.state?.astrologer;

  // Safety check agar state khali ho
  if (!astroData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f7f5] dark:bg-[#221910]">
        <button onClick={() => navigate(-1)} className="bg-[#f27f0d] text-white px-6 py-2 rounded-full font-bold">Go Back</button>
      </div>
    );
  }

  // --- CHAT BUTTON LOGIC ---
  const handleChatNow = () => {
    navigate("/user/astro/chat", {
      state: { astrologer: astroData }
    });
  };

  const expertise = astroData.skills ? astroData.skills.split(',') : ["Vedic Astrology"];
  const stats = [
    { label: 'Consultations', value: astroData.consultations || '12K+' },
    { label: 'Rating', value: astroData.rating || '4.8', icon: true },
    { label: 'Followers', value: astroData.followers || '5.2K' },
  ];

  const pastSessions = [
    { id: 1, title: "Mercury Retrograde Impacts", duration: "12:45", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCz4wTZ9ATq5LCy7XB-oQbVWUyzYtGiT4fGQWv_iSd9qcdW9JisLcT1LtTe9YdnD2w_9mlg6nrkjOZKPSLQb0YVkPvyzsYt1x84Lw-o1GtEN2PiXyKX25JqWgQK01e2znvJciA8kdB-FEueRFC3iObq7CgvXuvkQ4l7midZ4z0kZgWsEhTX248IgL30AJ14PMfCMv28EVuHetEM8Gclv3X-JkuXHobKirm7dC_MZxugVZW3M3Qk_Pf2HzvnlAcOq__ytBU3HPOg6s" },
    { id: 2, title: "Marriage Remedies 2024", duration: "08:20", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzKWhqIukYDQ4RoBR96mXrY3IV-A75CbjuXIOIjhcv7VYCJ9RjMfjIakeIidOl4evdnY3mUSWdS6CWJ0huv0TQLAy6RGRWHVNVsx9MPuagU7eDwLGSDA2YycH-FFyBsaXtJibrHiCDEQYAcqK-3L-PTR4yoFnK6sMnHP4wuvC22z1QjL_LM7ux8M1fFhJVQ3dQ9RCFpN9UUEq1QplXHQthK0A-N3-gXjY1o9Ln3nfarPYO-WyfVb53mPJaN2jfweaZMLBmlRRZ4fo" },
    { id: 3, title: "Weekly Horoscope Live", duration: "15:10", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqIJXmd7egIuk77a4Pux4cTXFrbebMJSggghQVNV13rJunNAHt3Ue5_5HM5j9VERedTTqHBY_uLGpQgFzoYp2PAyyhcjV89bvRDBqfDVMhs_fOBsvKjYqqlzglQS2T-Nuaw1r2aSKmPUGBVcNMV7P5iuaUMhhZ2AmQRZB2OOiY0lQpPaKMtpmGvg5jLFztsJgmLplU1h0xqsbrK0Nhq95Cfff0ajbofEH6Ahag0phvhpEU_-qTxm2sNCWfZRguK4YapmLVq6fPxQo" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#221910] text-[#181411] dark:text-white font-['Plus_Jakarta_Sans'] pb-24">
      <div className="relative flex flex-col w-full max-w-md mx-auto overflow-x-hidden group/design-root">
        
        {/* Top Navigation */}
        <nav className="sticky top-0 z-50 flex items-center justify-between p-4 pb-2 bg-white/80 dark:bg-[#221910]/80 backdrop-blur-md">
          <div onClick={() => navigate(-1)} className="flex items-center justify-center cursor-pointer size-12">
            <ArrowLeft className="w-6 h-6" />
          </div>
          <h2 className="flex-1 text-lg font-bold tracking-tight text-center">Astrologer Profile</h2>
          <div className="flex items-center justify-end w-12">
            <button className="p-0 bg-transparent">
              <Wallet className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* Header Image */}
        <div className="relative w-full h-48 overflow-hidden bg-gradient-to-r from-[#f27f0d] to-orange-300">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* Profile Card Info */}
        <div className="relative z-10 px-4 -mt-16">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-32 border-4 border-white shadow-xl aspect-square rounded-full dark:border-stone-900 bg-stone-200"
              style={{ 
                backgroundImage: `url(${astroData.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuATkIeLQXEejOLI3mhE7kIiRxqRp9qcUuLtfhRER6sxnwSPT6bQTv9Jx1LX3jQVHubZHx8wb_avm2k-JfdZ905ItKaoIg82-KB-eA3xiFAj_pkOWL5gOmfX11lwAAPscNRhQHGPQdsDnXd5oruBObst8Ju6VZyaNPzvKLuEIHSl8vyraIpLfy5AokBHjCU0WoswNxNnTwOVP3cH0_-Oq0Pi4Dbw2JwyLWgu0AXRw4KQy063teJCH8nSdWVcOOK8ybEpT9SmyRP8Y-c'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1">
                <p className="text-[22px] font-bold uppercase">{astroData.name}</p>
                <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/20" />
              </div>
              <p className="text-[#8a7560] dark:text-stone-400 text-base">{expertise[0]} Expert</p>
              <p className="text-[#8a7560] dark:text-stone-400 text-sm">{astroData.experience || '15'}+ Years Experience | {astroData.language || 'Hindi, English'}</p>
            </div>
            <button 
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex min-w-[120px] items-center justify-center rounded-full h-10 px-6 text-sm font-bold transition-all shadow-lg ${
                isFollowing ? 'bg-stone-200 text-stone-800' : 'bg-[#f27f0d] text-white shadow-orange-500/20'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap gap-3 p-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col flex-1 gap-1 p-4 bg-white border shadow-sm dark:bg-stone-800 rounded-xl border-stone-100 dark:border-stone-700 min-w-[100px]">
              <p className="text-xs font-medium text-[#8a7560] dark:text-stone-400">{stat.label}</p>
              <div className="flex items-center gap-1">
                <p className="text-xl font-bold">{stat.value}</p>
                {stat.icon && <Star className="w-4 h-4 text-[#f27f0d] fill-[#f27f0d]" />}
              </div>
            </div>
          ))}
        </div>

        {/* Consult Now Card */}
        <div className="px-4 py-2">
          <div className="p-4 bg-white border border-orange-100 shadow-md dark:bg-stone-800 rounded-2xl dark:border-stone-700">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase text-[#f27f0d]">Available Now</p>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Wait time: ~2 mins</p>
              </div>
              <p className="text-lg font-bold">₹{astroData.price || '25'}/min</p>
            </div>
            <div className="flex gap-3">
              {/* CHAT NOW BUTTON PE LOGIC LAGA DIYA */}
              <button 
                onClick={handleChatNow}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl h-12 bg-white dark:bg-stone-700 border-2 border-[#f27f0d] text-[#f27f0d] font-bold active:scale-95 transition-transform"
              >
                <MessageSquare size={20} /> Chat Now
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-xl h-12 bg-[#f27f0d] text-white font-bold shadow-lg shadow-orange-500/30 active:scale-95 transition-transform">
                <Phone size={20} /> Call Now
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="px-4 pt-6">
          <h3 className="pb-2 text-lg font-bold">About {astroData.name}</h3>
          <p className="text-sm leading-relaxed text-[#4a4540] dark:text-stone-300">
            {astroData.about || `${astroData.name} is a renowned Expert with over ${astroData.experience || '15'} years of experience in guiding thousands of people across the globe.`}
          </p>
        </section>

        {/* Expertise */}
        <section className="px-4 pt-6">
          <h3 className="pb-3 text-lg font-bold">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {expertise.map((item, i) => (
              <span key={i} className="bg-[#f27f0d]/10 text-[#f27f0d] px-3 py-1.5 rounded-full text-xs font-semibold">
                {item.trim()}
              </span>
            ))}
          </div>
        </section>

        {/* Past Sessions */}
        <section className="pt-6">
          <div className="flex items-center justify-between px-4 pb-3">
            <h3 className="text-lg font-bold">Past Live Sessions</h3>
            <span className="text-sm font-bold text-[#f27f0d] cursor-pointer">See All</span>
          </div>
          <div className="flex gap-4 px-4 pb-2 overflow-x-auto no-scrollbar">
            {pastSessions.map((session) => (
              <div key={session.id} className="flex-none w-48">
                <div className="relative overflow-hidden aspect-video bg-stone-200 rounded-xl">
                  <img src={session.img} alt={session.title} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <PlayCircle className="text-white w-10 h-10" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
                    {session.duration}
                  </div>
                </div>
                <p className="mt-2 text-sm font-semibold truncate">{session.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="px-4 pt-6 pb-10">
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-lg font-bold">Recent Reviews</h3>
            <span className="text-sm font-bold text-[#f27f0d] cursor-pointer">Write a Review</span>
          </div>
          <div className="space-y-4">
            <ReviewCard name="Rahul Kapoor" initial="RK" text="Highly accurate prediction regarding my promotion." />
            <ReviewCard name="Priya S." initial="PS" text="Very calm and patient listener." />
          </div>
        </section>

        <div className="h-8 bg-transparent" />
      </div>

      <BottomNav />
    </div>
  );
};

const ReviewCard = ({ name, initial, text }) => (
  <div className="p-4 bg-white border border-stone-100 dark:bg-stone-800 rounded-xl dark:border-stone-700">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center font-bold bg-orange-100 rounded-full size-8 text-[#f27f0d] text-xs">
          {initial}
        </div>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="text-[#f27f0d] fill-[#f27f0d]" />
            ))}
          </div>
        </div>
      </div>
      <span className="text-xs text-stone-400">2 days ago</span>
    </div>
    <p className="text-sm italic text-stone-600 dark:text-stone-300">"{text}"</p>
  </div>
);

export default AstrologerProfile;