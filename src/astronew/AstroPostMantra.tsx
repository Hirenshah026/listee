import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Send, Type, FileText, CheckCircle2, 
  Sparkles, UserCircle, Languages, Trash2, Edit3, X 
} from 'lucide-react';
import axios from 'axios';
import BottomNav from './components/BottomNavNew';
import useUser from "../hooks/useUser";

// --- API Base Variable ---
const API_BASE_URL = "https://listee-backend.onrender.com/api/";

const AstroPostMantra: React.FC = () => {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState({ sanskrit: '', hindi: '', english: '' });
  const [activeTab, setActiveTab] = useState<'sanskrit' | 'hindi' | 'english'>('sanskrit');
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [myMantras, setMyMantras] = useState<any[]>([]);
  
  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState('');

  // 1. Fetch My Mantras
  const fetchMyMantras = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/mantras-astro/${user._id}`);
      setMyMantras(res.data.data);
    } catch (err) { console.error("Fetch error", err); }
  };

  useEffect(() => { fetchMyMantras(); }, [user]);

  // 2. Handle Create / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    const token = localStorage.getItem("token");
    const payload = { title, content, astroId: user?._id, astroName: user?.name };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/mantras/update/${currentEditId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/mantras/add`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setIsPosting(false);
      setShowSuccess(true);
      resetForm();
      fetchMyMantras();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setIsPosting(false);
      alert("Action failed!");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bhai, pakka delete karna hai?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/mantras/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyMantras();
    } catch (err) { alert("Delete failed"); }
  };

  // 4. Set Edit Mode
  const startEdit = (mantra: any) => {
    setIsEditing(true);
    setCurrentEditId(mantra._id);
    setTitle(mantra.title);
    setContent(mantra.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle('');
    setContent({ sanskrit: '', hindi: '', english: '' });
    setIsEditing(false);
    setCurrentEditId('');
  };

  return (
    <div className="bg-slate-200 min-h-screen flex justify-center overflow-x-hidden pb-24">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />

      <div className="w-full max-w-[450px] bg-slate-50 min-h-screen shadow-2xl flex flex-col relative">
        
        {/* Header */}
        <header className="bg-orange-600 px-6 pt-12 pb-20 rounded-b-[45px] relative overflow-hidden shrink-0">
          <div className="relative z-10 flex justify-between items-center text-white">
            <button className="p-2.5 bg-white/20 rounded-2xl"><ChevronLeft size={22} /></button>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-100/80">Astro Creator Studio</p>
              <h2 className="text-sm font-bold tracking-tight">{isEditing ? "Edit Mantra" : "Post New Mantra"}</h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
               {user?.image ? <img src={user.image} className="w-full h-full object-cover"/> : <UserCircle size={24} />}
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-40"></div>
        </header>

        {/* Main Form */}
        <main className="px-6 -mt-10 z-20 flex-1 overflow-y-auto no-scrollbar">
          
          {showSuccess && (
            <div className="bg-green-500 text-white p-4 rounded-3xl flex items-center gap-3 shadow-lg mb-4">
              <CheckCircle2 size={24} />
              <p className="text-xs font-bold">Mantra {isEditing ? "Updated" : "Published"}! ✨</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white rounded-[30px] p-5 shadow-sm border border-slate-100">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Type size={14} className="text-orange-500" /> Title</label>
              <input placeholder="Title..." className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="flex bg-slate-200/70 p-1.5 rounded-2xl gap-1">
              {(['sanskrit', 'hindi', 'english'] as const).map((l) => (
                <button key={l} type="button" onClick={() => setActiveTab(l)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === l ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>{l}</button>
              ))}
            </div>

            <div className="bg-white rounded-[35px] p-5 shadow-sm border border-slate-100">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3"><Languages size={14} className="text-orange-500" /> {activeTab} Content</label>
              <textarea rows={5} placeholder={`Write ${activeTab} content...`} className="w-full bg-slate-50 border-none rounded-[25px] p-5 text-base font-bold text-slate-800 outline-none resize-none" value={content[activeTab]} onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })} />
            </div>

            <div className="flex gap-3">
               {isEditing && (
                 <button type="button" onClick={resetForm} className="flex-1 py-5 rounded-[30px] font-black text-sm bg-slate-200 text-slate-500">CANCEL</button>
               )}
               <button type="submit" disabled={isPosting} className={`flex-[2] py-5 rounded-[30px] font-black text-sm flex items-center justify-center gap-3 shadow-xl transition-all ${isPosting ? 'bg-slate-300' : 'bg-orange-600 text-white'}`}>
                 {isPosting ? "Wait..." : isEditing ? "UPDATE MANTRA" : "POST MANTRA"}
               </button>
            </div>
          </form>

          {/* Manage Mantras List */}
          <div className="mt-12 space-y-4 pb-20">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                <Edit3 size={14} className="text-orange-500" /> My Published Mantras
             </h3>
             {myMantras.map((m) => (
               <div key={m._id} className="bg-white p-5 rounded-[30px] border border-slate-100 shadow-sm flex justify-between items-start animate-in fade-in slide-in-from-bottom-2">
                 <div className="max-w-[70%]">
                    <h4 className="text-xs font-black text-orange-600 uppercase mb-1">{m.title}</h4>
                    <p className="text-xs font-bold text-slate-600 line-clamp-1 italic">"{m.content.sanskrit}"</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => startEdit(m)} className="p-2.5 bg-blue-50 text-blue-500 rounded-xl active:scale-90"><Edit3 size={16}/></button>
                    <button onClick={() => handleDelete(m._id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl active:scale-90"><Trash2 size={16}/></button>
                 </div>
               </div>
             ))}
          </div>
        </main>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-50">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default AstroPostMantra;