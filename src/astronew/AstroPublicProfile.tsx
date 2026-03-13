import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, CheckCircle2, AlertTriangle, BookOpen, Star, Languages, Award } from 'lucide-react';
import axios from 'axios';
import BottomNav from "./components/BottomNavNew";
import useUser from "../hooks/useUser";

const API_BASE_URL = "https://listee-backend.onrender.com";

const AstroPublicProfile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const astroData = location.state?.astrologer;

  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!astroData?._id) return;
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/follow/status/${user?._id || 'guest'}/${astroData._id}`);
        setIsFollowing(res.data.following);
        setFollowCount(Math.max(0, res.data.totalFollowers || 0));
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [user?._id, astroData?._id]);

  const executeToggle = async () => {
    setIsProcessing(true);
    setShowModal(false);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/follow/toggle`, {
        userId: user?._id,
        astrologerId: astroData?._id
      });
      if (res.data.success) {
        setIsFollowing(res.data.following);
        setFollowCount(Math.max(0, res.data.newCount));
      }
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  if (userLoading) return <div className="min-h-screen bg-[#f8f7f5] p-4 animate-pulse"><div className="h-64 bg-stone-200 rounded-3xl"></div></div>;

  return (
    <div className="min-h-screen bg-[#f8f7f5] pb-24">
      {/* Modal code... wahi rahega */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
            <h3 className="text-lg font-bold">Unfollow {astroData?.name}?</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-stone-500">Cancel</button>
              <button onClick={executeToggle} className="flex-1 py-3 font-bold text-white bg-red-600 rounded-xl">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        {/* Nav... */}
        <nav className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-md sticky top-0 z-50">
          <ArrowLeft onClick={() => navigate(-1)} className="cursor-pointer" />
          <h2 className="font-bold">Astrologer Profile</h2>
          <Wallet className="text-[#f27f0d]" />
        </nav>

        {/* Profile Card */}
        <div className="px-4 mt-6">

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 text-center">
            <img src={astroData?.image || "/banners/astrouser.jpg"} className="w-24 h-24 rounded-2xl mx-auto bg-stone-200 object-cover" alt="astro" />
            <h1 className="text-xl font-black mt-4">{astroData?.name}</h1>
            <p className="text-sm text-stone-500 font-medium">Vedic Astrology • 12 Yrs Exp</p>

            <button
              onClick={() => user ? (isFollowing ? setShowModal(true) : executeToggle()) : alert('Login first')}
              disabled={isProcessing}
              className={`mt-4 px-10 py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 mx-auto transition-all duration-300 ${isFollowing
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-[#f27f0d] text-white shadow-lg shadow-orange-500/20 hover:bg-[#d66e0a]'
                }`}
            >
              {isProcessing ? "Processing..." : isFollowing ? <><CheckCircle2 size={16} /> Following</> : "Follow Astrologer"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-4 py-4 grid grid-cols-3 gap-3">
          {[{ l: 'FOLLOWERS', v: followCount }, { l: 'RATING', v: '4.9' }, { l: 'CONSULTS', v: '12K+' }].map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl text-center shadow-sm">
              <p className="text-[10px] text-stone-400 font-bold">{item.l}</p>
              <p className="font-black text-sm mt-1">{item.v}</p>
            </div>
          ))}
        </div>

        {/* New Sections */}
        <div className="px-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-[#f27f0d]"><BookOpen size={18} /> <span className="font-bold text-stone-800">Expertise</span></div>
            <div className="flex flex-wrap gap-2">
              {["Career", "Marriage", "Health", "Kundli", "Vastu"].map(tag => (
                <span key={tag} className="bg-orange-50 text-[#f27f0d] px-3 py-1 rounded-full text-[11px] font-bold">{tag}</span>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-[#f27f0d]"><Languages size={18} /> <span className="font-bold text-stone-800">Languages</span></div>
            <p className="text-sm text-stone-600">English, Hindi, Sanskrit, Bengali</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default AstroPublicProfile;