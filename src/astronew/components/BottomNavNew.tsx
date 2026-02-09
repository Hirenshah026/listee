import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Video, PhoneCall, Sparkles, UserCircle } from 'lucide-react';

const BottomNavNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [showRoleModal, setShowRoleModal] = useState(!localStorage.getItem("role"));

  // Jab user role choose karega
  const handleRoleSelection = (selectedRole: string) => {
    localStorage.setItem("role", selectedRole);
    setRole(selectedRole);
    setShowRoleModal(false);
    
    // Ab ye seedha HOME par bhejega, login par nahi
    if (selectedRole === "astro") {
      navigate("/astro/home");
    } else {
      navigate("/"); // Normal user home
    }
  };

  const tabs = role ? [
    { id: 'home', label: "Home", icon: Home, path: role === "astro" ? "/astro/home" : "/" },
    { 
      id: 'chat', 
      label: "Chat", 
      icon: MessageSquare, 
      path: role === "astro" ? "/astro/chat/user" : "/user/astro/list" 
    },
    { 
      id: 'live', 
      label: "Live", 
      icon: Video, 
      path: role === "astro" ? "/astro/live" : "/user/astro/live/user" 
    },
    { id: 'call', label: "Call", icon: PhoneCall, path: "/call" },
    { id: 'panchang', label: "Panchang", icon: Sparkles, path: "/astro/panchang" },
  ] : [];

  return (
    <>
      {/* --- Role Selection Modal --- */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
          <div className="bg-white w-full max-w-xs rounded-[40px] p-8 text-center shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">SWAGAT HAI</h2>
            <p className="text-slate-500 text-xs mb-8 font-bold uppercase tracking-widest">Select Your Profile</p>
            
            <div className="flex justify-around gap-6">
              <button 
                onClick={() => handleRoleSelection("astro")}
                className="flex flex-col items-center gap-3 active:scale-90 transition-transform"
              >
                <div className="h-20 w-20 bg-orange-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-orange-200">
                  <Video size={32} />
                </div>
                <span className="text-[10px] font-black text-slate-800 tracking-tighter">ASTROLOGER</span>
              </button>

              <button 
                onClick={() => handleRoleSelection("user")}
                className="flex flex-col items-center gap-3 active:scale-90 transition-transform"
              >
                <div className="h-20 w-20 bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-blue-200">
                  <UserCircle size={32} />
                </div>
                <span className="text-[10px] font-black text-slate-800 tracking-tighter">USER / CLIENT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Bottom Navigation Bar --- */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 pt-3 pb-8 flex justify-between items-end z-[100] rounded-t-[35px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          if (tab.id === 'live') {
            return (
              <Link key={tab.id} to={tab.path} className="flex flex-col items-center -mt-14 no-underline group">
                <div className="h-16 w-16 bg-gradient-to-tr from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white shadow-2xl border-[6px] border-white active:scale-95 transition-all">
                  <Icon size={26} fill={isActive ? "currentColor" : "none"} />
                </div>
                <span className={`text-[9px] font-black mt-2 uppercase tracking-widest ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex flex-col items-center no-underline transition-all ${
                isActive ? 'text-orange-600 scale-110' : 'text-slate-300'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[9px] font-bold mt-1 uppercase">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNavNew;