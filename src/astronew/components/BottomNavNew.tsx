import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Video, PhoneCall, Sparkles } from 'lucide-react';

const BottomNavNew = () => {
  const location = useLocation();
  const role = localStorage.getItem("role"); // 'astro' or 'user'

  const tabs = [
    { id: 'home', label: "Home", icon: Home, path: "/astro/home" },
    { 
      id: 'chat', 
      label: "Chat", 
      icon: MessageSquare, 
      path: role === "astro" ? "/astro/chat/user" : "/astro/list" 
    },
    { 
      id: 'live', 
      label: "Live", 
      icon: Video, 
      path: role === "astro" ? "/astro/live" : "/astro/live/user" 
    },
    { id: 'call', label: "Call", icon: PhoneCall, path: "/call" },
    { id: 'panchang', label: "Panchang", icon: Sparkles, path: "/astro/panchang" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 pt-3 pb-8 flex justify-between items-end z-[100] rounded-t-[35px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
      
      {tabs.map((tab) => {
        const Icon = tab.icon;
        // Check if current path matches tab path
        const isActive = location.pathname === tab.path;

        if (tab.id === 'live') {
          return (
            <Link key={tab.id} to={tab.path} className="flex flex-col items-center -mt-14 no-underline group">
              <div className="h-16 w-16 bg-gradient-to-tr from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-orange-200 border-[6px] border-white active:scale-95 transition-all duration-200">
                <Icon size={26} fill={isActive ? "currentColor" : "none"} />
              </div>
              <span className={`text-[9px] font-black mt-2 uppercase tracking-widest ${isActive ? 'text-orange-600' : 'text-red-600'}`}>
                {tab.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`flex flex-col items-center cursor-pointer no-underline transition-all duration-200 ${
              isActive ? 'text-orange-600 scale-110' : 'text-slate-300'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 3 : 2} />
            <span className="text-[9px] font-bold mt-1 uppercase">{tab.label}</span>
          </Link>
        );
      })}

    </nav>
  );
};

export default BottomNavNew;