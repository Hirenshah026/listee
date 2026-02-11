import React, { useState, useEffect } from 'react';
import { 
  User, Wallet, History, Settings, 
  HelpCircle, LogOut, ChevronRight, 
  ShieldCheck, Bell, CreditCard, Camera, Edit2, Save, X, Loader2, Mail, MapPin,Phone
} from 'lucide-react';
import BottomNav from './components/BottomNavNew';
import useUser from "../hooks/useUser";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// TypeScript Interface
interface ProfileFormData {
  name: string;
  email: string;
  mobile: string;
  address: string;
}

const ProfilePage = () => {
  const { user, loading, refreshUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({ 
    name: "", email: "", mobile: "", address: ""
  });

  const API_URL = "https://listee-backend.onrender.com";
  // Sync data from hook to local state
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
    const loadingToast = toast.loading("Profile update ho rahi hai...");

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
        toast.success("Profile updated! ✨", { id: loadingToast });
        setIsEditing(false);
        refreshUser();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Server error!", { id: loadingToast });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="bg-gray-100 flex justify-center min-h-screen">
      <Toaster position="top-center" />
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}} />

      <div className="w-full max-w-md bg-slate-50 min-h-screen relative flex flex-col pb-32">
        
        {/* --- 1. Top Header Profile Card --- */}
        <header className="bg-orange-600 px-5 pt-10 pb-16 rounded-b-[40px] relative overflow-hidden transition-all duration-500">
          <div className="relative z-10 flex flex-col items-center text-white">
            
            {/* Edit/Cancel Toggle */}
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="absolute -top-4 -right-2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"
            >
              {isEditing ? <X size={20} /> : <Edit2 size={18} />}
            </button>

            <div className="relative">
              <img 
                src={user?.image || "/banners/astrouser.jpg"} 
                className="w-24 h-24 rounded-full border-4 border-white/30 shadow-2xl object-cover" 
                alt="User" 
              />
              <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full text-orange-600 shadow-lg cursor-pointer">
                <Camera size={16} />
              </div>
            </div>

            {isEditing ? (
              <div className="mt-4 w-full flex flex-col items-center">
                <input 
                  className="bg-orange-500/50 border-b-2 border-white outline-none text-center text-xl font-extrabold w-4/5 py-1 placeholder:text-orange-200"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter Name"
                />
                <p className="mt-2 text-orange-100 text-xs font-bold uppercase tracking-widest">Editing Profile</p>
              </div>
            ) : (
              <>
                <h2 className="mt-4 text-xl font-extrabold">{loading ? "Loading..." : (user?.name || "User Name")}</h2>
                <p className="text-orange-100 text-xs font-bold">{user?.mobile || "+91 XXXXX XXXXX"}</p>
              </>
            )}
          </div>
          
          {/* Background Design */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-50"></div>
        </header>

        <main className="px-5 -mt-8 z-20 space-y-6">
          
          {/* --- 2. Wallet Quick Card (Only show if not editing) --- */}
          {!isEditing ? (
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-orange-100 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Balance</p>
                  <p className="text-xl font-black text-slate-800">₹{user?.walletBalance || "0"}.00</p>
                </div>
              </div>
              <button className="bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-200 active:scale-95 transition-all">
                RECHARGE
              </button>
            </div>
          ) : (
            /* --- 2.5 Save Button (Visible only when editing) --- */
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full bg-green-600 text-white py-4 rounded-3xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-green-100 active:scale-95 transition-all"
            >
              {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isUpdating ? "UPDATING..." : "SAVE PROFILE CHANGES"}
            </button>
          )}

          {/* --- 3. Editable Fields / Menu Options --- */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">
              {isEditing ? "Edit Account Info" : "Account Settings"}
            </h3>
            
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              {isEditing ? (
                <>
                  <EditInput 
                    icon={<Mail size={20}/>} 
                    label="Email Address" 
                    value={formData.email} 
                    onChange={(val: string) => setFormData({...formData, email: val})} 
                  />
                  <EditInput 
                    icon={<Phone size={20}/>} 
                    label="Phone Number" 
                    value={formData.mobile} 
                    onChange={(val: string) => setFormData({...formData, mobile: val})} 
                  />
                  <EditInput 
                    icon={<MapPin size={20}/>} 
                    label="Your Address" 
                    value={formData.address} 
                    onChange={(val: string) => setFormData({...formData, address: val})} 
                    isLast 
                  />
                </>
              ) : (
                <>
                  <MenuOption icon={<History size={20}/>} title="My Consultations" subtitle="Chat & Call history" />
                  <MenuOption icon={<CreditCard size={20}/>} title="My Bookings" subtitle="Pooja & Ritual status" />
                  <MenuOption icon={<Bell size={20}/>} title="Notifications" subtitle="Offers & Session alerts" />
                  <MenuOption icon={<ShieldCheck size={20}/>} title="Privacy Policy" subtitle="Your data is safe with us" />
                  <MenuOption icon={<HelpCircle size={20}/>} title="Support & Help" subtitle="24/7 Customer assistance" isLast />
                </>
              )}
            </div>
          </div>

          {/* --- 4. Logout Button --- */}
          {!isEditing && (
            <button 
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 py-4 rounded-3xl font-black text-sm flex items-center justify-center gap-2 border border-red-100 active:scale-95 transition-all"
            >
              <LogOut size={18} /> LOGOUT
            </button>
          )}

          <p className="text-center text-[10px] text-slate-300 font-bold">App Version 2.0.26</p>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

// Helper component for Menu Items
const MenuOption = ({ icon, title, subtitle, isLast = false }: any) => (
  <div className={`flex items-center justify-between p-4 cursor-pointer active:bg-slate-50 transition-colors ${!isLast ? 'border-b border-slate-50' : ''}`}>
    <div className="flex items-center gap-4">
      <div className="text-slate-400">{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-300" />
  </div>
);

// Helper component for Editable Inputs
const EditInput = ({ icon, label, value, onChange, isLast = false }: any) => (
  <div className={`p-4 flex items-center gap-4 ${!isLast ? 'border-b border-slate-50' : ''}`}>
    <div className="text-orange-400 bg-orange-50 p-2 rounded-xl">{icon}</div>
    <div className="flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
      <input 
        className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent border-b border-transparent focus:border-orange-200 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

export default ProfilePage;