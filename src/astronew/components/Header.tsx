import { useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, Bell, Menu, X, User } from "lucide-react"; // Lucid icons for premium feel
import useUser from "../../hooks/useUser";

const Header = () => {
  const role = localStorage.getItem("role");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useUser();

  const menuLinks = [
    { label: "Profile", path: role === "chatuser" ? "/user/profile" : "/astro/profile" },
    { label: "Settings", path: "/astro/settings" },
    { label: "My Orders", path: "/astro/orders" },
    { label: loading ? "Logout" : "Login", path: "/astro/logout" },
    { label: loading ? "user Logout" : "User Login", path: "/user/login" },
  ];

  return (
    <>
      {/* --- Main Premium Header --- */}
      <header className="bg-orange-600 px-5 pt-5 pb-4 rounded-b-[40px] sticky top-0 z-50 shadow-lg w-full max-w-[450px] mx-auto">
        <div className="flex justify-between items-center text-white mb-2">
          
          {/* Left: Menu & Brand */}
          <div className="flex items-center gap-3">
            {/* Menu Trigger / Avatar */}
            <div 
              className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-orange-400 text-xl cursor-pointer active:scale-90 transition-transform overflow-hidden shadow-inner"
              onClick={() => setSidebarOpen(true)}
            >
              {user?.image ? (
                <img src={user.image} className="w-full h-full object-cover" alt="p" />
              ) : (
                "A"
              )}
            </div>
            
            <div>
              <p className="text-[10px] opacity-80 font-bold uppercase tracking-tight">Daily Darshan</p>
              <h1 className="text-lg font-extrabold leading-none tracking-tight uppercase">
                {loading ? "Hi..." : (user?.name || "LISTEE ASTRO")}
              </h1>
            </div>
          </div>

          {/* Right: Wallet & Notifications */}
          <div className="flex items-center gap-4">
            <div className="bg-orange-500/50 px-3 py-1.5 rounded-full border border-orange-400/30 flex items-center gap-2 shadow-sm">
              <Wallet size={14} className="text-orange-100" />
              <span className="text-xs font-bold">₹150</span>
            </div>
            <div className="relative">
              <Bell size={20} className="text-white active:scale-90 transition-transform cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full">2</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- Sidebar Overlay --- */}
      <div
        className={`fixed inset-0 flex justify-center z-[100] transition-all duration-300 ${
          sidebarOpen ? "visible" : "invisible"
        }`}
      >
        {/* Background Blur Overlay */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar Body */}
        <div
          className={`relative h-full bg-white shadow-2xl w-full max-w-[450px] transition-transform duration-300 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Header (Orange Theme) */}
          <div className="p-6 flex justify-between items-center bg-orange-600 text-white rounded-br-[40px]">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-orange-600 text-2xl font-bold shadow-lg overflow-hidden border-2 border-orange-400">
                  {user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : <User size={28} />}
               </div>
               <div>
                  <h2 className="font-extrabold text-lg leading-tight uppercase">{user?.name || "Guest User"}</h2>
                  <p className="text-[10px] uppercase font-bold text-orange-200 tracking-widest">Astro Profile</p>
               </div>
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Links */}
          <nav className="flex flex-col p-4 pt-8 gap-2">
            {menuLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="text-gray-700 font-bold p-4 rounded-2xl hover:bg-orange-50 flex items-center justify-between group transition-all border border-transparent hover:border-orange-100"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="group-hover:text-orange-600 transition-colors">{link.label}</span>
                <span className="text-orange-200 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all">→</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Branding */}
          <div className="absolute bottom-10 w-full text-center">
             <div className="flex justify-center mb-2 opacity-20">
                <img src="/logo.png" alt="" className="h-8 grayscale" />
             </div>
             <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">Listee Astro v2.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;