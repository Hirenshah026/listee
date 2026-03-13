import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Share2, Heart, AlertTriangle } from 'lucide-react';
import BottomNav from '../components/BottomNavNew';
import useUser from '../../hooks/useUser';

const API_BASE_URL = "https://listee-backend.onrender.com/api";

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

const MantraPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [mantra, setMantra] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sanskrit' | 'hindi' | 'english'>('sanskrit');
  const [loading, setLoading] = useState(true);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const imageUrl = "https://t4.ftcdn.net/jpg/18/31/30/61/240_F_1831306129_HyhG4huBNMZ1FZ6R5WM95ay4PX51HNNc.jpg";

  useEffect(() => {
    const fetchMantra = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/mantras/${id}`);
        setMantra(res.data.data);
        setLikeCount(res.data.data.likes?.length || 0);
        setIsLiked(res.data.data.likes?.includes(user?._id));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchMantra();
  }, [id, user?._id]);

  useEffect(() => {
    if (!mantra?.astroId || !user?._id) return;
    const fetchFollowStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/follow/status/${user._id}/${mantra.astroId}`);
        setIsFollowing(res.data.following);
        setFollowCount(res.data.totalFollowers || 0);
      } catch (err) { console.error(err); }
    };
    fetchFollowStatus();
  }, [user?._id, mantra?.astroId]);

  const executeToggle = async () => {
    if (!user?._id || !mantra?.astroId) return;
    setIsProcessing(true);
    setShowModal(false);
    try {
      const res = await axios.post(`${API_BASE_URL}/follow/toggle`, {
        userId: user._id,
        astrologerId: mantra.astroId
      });
      if (res.data.success) {
        setIsFollowing(res.data.following);
        setFollowCount(res.data.newCount);
      }
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  const toggleLike = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/mantras/${id}/like`, { userId: user._id });
      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikeCount(res.data.count);
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="bg-gray-100 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative p-5 space-y-6">
        <Skeleton className="h-48 w-full rounded-[40px]" />
        <div className="flex justify-center -mt-20"><Skeleton className="w-36 h-36 rounded-[35px]" /></div>
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-12" />
        <Skeleton className="w-full h-64" />
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative flex flex-col pb-32 shadow-2xl">
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
              <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-bold">Unfollow {mantra?.astroName}?</h3>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-stone-500">Cancel</button>
                <button onClick={executeToggle} className="flex-1 py-3 font-bold text-white bg-red-600 rounded-xl">Confirm</button>
              </div>
            </div>
          </div>
        )}

        <header className="bg-orange-600 px-6 pt-12 pb-24 rounded-b-[50px] relative shadow-xl">
          <div className="relative z-10 flex justify-between items-center text-white">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white/20 rounded-2xl active:scale-90"><ChevronLeft size={22} /></button>
            <h2 className="text-sm font-bold">{mantra?.title}</h2>
            <button className="p-2.5 bg-white/20 rounded-2xl"><Share2 size={20} /></button>
          </div>
        </header>

        <main className="px-5 -mt-16 z-20 space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-36 h-36 bg-white rounded-[35px] p-2 shadow-2xl border border-white/50">
              <img src={mantra?.image ? `https://listee-backend.onrender.com${mantra.image}` : imageUrl} alt="Mantra"  className="w-full h-full object-cover rounded-[28px]" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
            <Link to={`/user/view/astro/${mantra?.astroId}`} className="flex items-center gap-3">
              <img src={imageUrl} alt="Astrologer" className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-100" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">{mantra?.astroName}</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{followCount} Followers</p>
              </div>
            </Link>
            <button 
              onClick={() => isFollowing ? setShowModal(true) : executeToggle()}
              disabled={isProcessing}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black shadow-lg ${isFollowing ? 'bg-slate-200 text-slate-600' : 'bg-orange-600 text-white'}`}
            >
              {isProcessing ? '...' : isFollowing ? 'FOLLOWED' : 'FOLLOW'}
            </button>
          </div>

          <div className="flex justify-center">
            <button onClick={toggleLike} className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-slate-100 active:scale-95 transition-all">
              <Heart size={20} className={isLiked ? "fill-red-500 text-red-500" : "text-slate-400"} />
              <span className="text-xs font-bold text-slate-600">{likeCount} Likes</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex bg-slate-200/70 p-1.5 rounded-2xl gap-1">
              {(['sanskrit', 'hindi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === lang ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-[32px] p-8 shadow-sm border min-h-[250px] flex items-center justify-center">
              <p className="text-slate-800 text-lg font-bold leading-loose text-center whitespace-pre-line">
                {mantra?.content[activeTab] || "Content not available."}
              </p>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default MantraPage;