import React, { useState, useEffect } from "react";
import Header from "./components/Header"; 
import BottomNavNew from "./components/BottomNavNew"; 
import useUser from "../hooks/useUser";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // ✅ Toast Import
import { 
  User, Mail, Phone, Wallet, Settings, MapPin,
  ChevronRight, History, ShieldCheck, HelpCircle, Edit2, Save, X, Loader2
} from "lucide-react";

interface ProfileFormData {
  name: string;
  email: string;
  mobile: string;
  address: string;
}

const UserProfile = () => {
  const { user, loading, refreshUser } = useUser(); 
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // ✅ Loading state for button
  
  const [formData, setFormData] = useState<ProfileFormData>({ 
    name: "", email: "", mobile: "", address: ""
  });

  const API_URL = "https://listee-backend.onrender.com";
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!formData.name) return toast.error("Name zaroori hai!");
    
    setIsUpdating(true);
    const loadingToast = toast.loading("Updating profile..."); // ✅ Loading toast

    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      const res = await axios.put(
        `${API_URL}/api/doctor-panel-update-profile`, 
        { 
          name: formData.name, 
          email: formData.email, 
          phone: formData.mobile,
          address: formData.address 
        },
        { headers: { Authorization: `Bearer ${token}`, role: role } }
      );

      if (res.data.success) {
        toast.success("Profile update ho gayi! ✨", { id: loadingToast }); // ✅ Success
        setIsEditing(false);
        refreshUser();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Kuch galti hui!", { id: loadingToast }); // ✅ Error
    } finally {
      setIsUpdating(false);
    }
  };

  const profileOptions = [
    { icon: <History size={20} />, label: "Transaction History", path: "/user/transactions" },
    { icon: <ShieldCheck size={20} />, label: "Privacy Policy", path: "/privacy" },
    { icon: <HelpCircle size={20} />, label: "Help & Support", path: "/support" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* ✅ Toaster container (zaroori hai toast dikhane ke liye) */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Header />

      <main className="w-full max-w-[450px] flex-1 pb-32 pt-6 px-5 space-y-6">
        
        {/* --- Profile Card --- */}
        <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center relative">
          <button 
            disabled={isUpdating}
            onClick={() => setIsEditing(!isEditing)}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all ${isEditing ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}
          >
            {isEditing ? <X size={20} /> : <Edit2 size={20} />}
          </button>

          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-orange-100 p-1 shadow-md overflow-hidden bg-orange-50">
              {user?.image ? (
                <img src={user.image} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-orange-600 font-black text-3xl">
                  {formData.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-4 w-full px-4">
               <input 
                className="text-center border-b-2 border-orange-400 outline-none text-xl font-black uppercase w-full bg-orange-50/50 py-1 rounded-t-lg"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Aapka Naam"
              />
            </div>
          ) : (
            <h2 className="mt-4 text-xl font-black text-slate-900 uppercase tracking-tight">
              {loading ? "Loading..." : (user?.name || "Guest User")}
            </h2>
          )}
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Premium Member</p>
        </div>

        {/* --- Account Details --- */}
        <div className="bg-white rounded-[30px] overflow-hidden border border-slate-100 shadow-sm">
           <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-orange-600 rounded-full" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Account Details</span>
              </div>
              
              {isEditing && (
                <button 
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1 uppercase shadow-md transition-all active:scale-95"
                >
                  {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  {isUpdating ? "Saving..." : "Save Now"}
                </button>
              )}
           </div>
           
           <div className="p-2 space-y-1">
              {/* Email Row */}
              <DetailRow 
                icon={<Mail size={18} />} 
                label="Email Address" 
                color="blue"
                isEditing={isEditing}
                value={formData.email}
                displayValue={user?.email}
                onChange={(val) => setFormData({...formData, email: val})}
              />

              {/* Phone Row */}
              <DetailRow 
                icon={<Phone size={18} />} 
                label="Phone Number" 
                color="green"
                isEditing={isEditing}
                value={formData.mobile}
                displayValue={user?.mobile}
                onChange={(val) => setFormData({...formData, mobile: val})}
              />

              {/* Address Row */}
              <DetailRow 
                icon={<MapPin size={18} />} 
                label="Location / Address" 
                color="purple"
                isEditing={isEditing}
                value={formData.address}
                displayValue={user?.address}
                onChange={(val) => setFormData({...formData, address: val})}
                placeholder="Enter your address"
              />
           </div>
        </div>

        {/* --- Options --- */}
        <div className="space-y-3">
          <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Quick Actions</p>
          <div className="bg-white rounded-[30px] p-2 border border-slate-100 shadow-sm">
            {profileOptions.map((opt, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border-b border-slate-50 last:border-none">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400 group-hover:text-orange-600 transition-colors">{opt.icon}</div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{opt.label}</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-600 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </main>
      <BottomNavNew />
    </div>
  );
};

// --- Helper Component to keep code clean ---
const DetailRow = ({ icon, label, color, isEditing, value, displayValue, onChange, placeholder }: any) => (
  <div className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-none">
    <div className={`w-10 h-10 bg-${color}-50 text-${color}-600 rounded-xl flex items-center justify-center`}>{icon}</div>
    <div className="flex-1">
      <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
      {isEditing ? (
        <input 
          className={`text-sm font-bold text-slate-800 border-b w-full outline-none border-${color}-200 py-1 bg-transparent`} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
        />
      ) : (
        <p className="text-sm font-bold text-slate-800">{displayValue || "Not set"}</p>
      )}
    </div>
  </div>
);

export default UserProfile;