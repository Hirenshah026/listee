import React from "react";
import Header from "./components/Header"; // Aapka Header component
import BottomNavNew from "./components/BottomNavNew"; // Aapka BottomNav component
import useUser from "../hooks/useUser";
import { 
  User, 
  Mail, 
  Phone, 
  Wallet, 
  Settings, 
  ChevronRight, 
  History, 
  ShieldCheck, 
  HelpCircle 
} from "lucide-react";

const UserProfile = () => {
  const { user, loading } = useUser();

  const profileOptions = [
    { icon: <History size={20} />, label: "Transaction History", path: "/user/transactions" },
    { icon: <ShieldCheck size={20} />, label: "Privacy Policy", path: "/privacy" },
    { icon: <HelpCircle size={20} />, label: "Help & Support", path: "/support" },
    { icon: <Settings size={20} />, label: "App Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* --- Fixed Header --- */}
      <Header />

      <main className="w-full max-w-[450px] flex-1 pb-32 pt-6 px-5 space-y-6">
        
        {/* --- Profile Card --- */}
        <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-orange-100 p-1 shadow-md overflow-hidden bg-orange-50">
              {user?.image ? (
                <img src={user.image} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-orange-600 font-black text-3xl">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 bg-orange-600 p-1.5 rounded-full border-2 border-white text-white">
              <User size={14} fill="currentColor" />
            </div>
          </div>

          <h2 className="mt-4 text-xl font-black text-slate-900 uppercase tracking-tight">
            {loading ? "Loading..." : (user?.name || "Guest User")}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Premium Member</p>
        </div>

        {/* --- Wallet Stats --- */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-600 rounded-[25px] p-5 text-white shadow-lg shadow-orange-100">
            <div className="flex justify-between items-start mb-2">
              <Wallet size={20} />
              <span className="text-[10px] font-black opacity-80 uppercase">Wallet</span>
            </div>
            <p className="text-2xl font-black italic">₹{user?.walletBalance || "0"}</p>
            <p className="text-[10px] mt-1 font-bold opacity-70">Current Balance</p>
          </div>

          <div className="bg-white rounded-[25px] p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2 text-slate-400">
              <Phone size={20} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Phone</span>
            </div>
            <p className="text-sm font-black text-slate-800">{user?.mobile || "+91 XXXXX-XXXXX"}</p>
            <p className="text-[10px] mt-1 font-bold text-slate-400">Verified No.</p>
          </div>
        </div>

        {/* --- User Info Section --- */}
        <div className="bg-white rounded-[30px] overflow-hidden border border-slate-100 shadow-sm">
           <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1 h-4 bg-orange-600 rounded-full" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Account Details</span>
           </div>
           
           <div className="p-2">
              <div className="flex items-center gap-4 p-4">
                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Mail size={18} />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Email Address</p>
                    <p className="text-sm font-bold text-slate-800">{user?.email || "notset@example.com"}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* --- Quick Actions / Options --- */}
        <div className="space-y-3">
          <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Quick Actions</p>
          <div className="bg-white rounded-[30px] p-2 border border-slate-100 shadow-sm">
            {profileOptions.map((option, index) => (
              <button 
                key={index}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border-b border-slate-50 last:border-none"
              >
                <div className="flex items-center gap-4">
                  <div className="text-slate-400 group-hover:text-orange-600 transition-colors">
                    {option.icon}
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">
                    {option.label}
                  </span>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* --- Fixed Bottom Nav --- */}
      <BottomNavNew />
    </div>
  );
};

export default UserProfile;