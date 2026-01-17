// Header.js
import { useState } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
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
      {/* Header Container */}
      <div className="w-full flex justify-center sticky top-0 z-40">
        <div className="bg-yellow-300 px-4 py-3 flex items-center justify-between shadow-md w-full max-w-[450px] rounded-b-xl">
          <div className="flex items-center gap-2">
            {/* User Icon */}
            <div
              className="w-9 h-9 rounded-full bg-white/50 border border-yellow-400 flex items-center justify-center cursor-pointer shadow-sm active:scale-90 transition-transform"
              onClick={() => setSidebarOpen(true)}
            >
              👤
            </div>
            
            <span className="font-bold text-gray-800 text-sm">
              {loading ? "Hi..." : `Hi, ${user?.name || "User"}`}
            </span>
          </div>

          <div className="flex gap-4">
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-800 cursor-pointer" />
            <FunnelIcon className="w-6 h-6 text-gray-800 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Sidebar Overlay - Sirf frame ke size ke andar rahega */}
      <div
        className={`fixed inset-0 flex justify-center z-[100] transition-all duration-300 ${
          sidebarOpen ? "visible" : "invisible"
        }`}
      >
        {/* Black Background Overlay */}
        <div 
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
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
          {/* Sidebar Header */}
          <div className="p-5 flex justify-between items-center bg-yellow-300 border-b border-yellow-400">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl shadow-inner">👤</div>
               <div>
                  <h2 className="font-bold text-gray-900 leading-tight">{user?.name || "User"}</h2>
                  <p className="text-[10px] uppercase font-bold text-yellow-700">My Account</p>
               </div>
            </div>
            <button
              className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full text-gray-800 font-bold text-2xl"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Menu Links */}
          <nav className="flex flex-col p-2 pt-4">
            {menuLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="text-gray-700 font-semibold p-4 rounded-xl hover:bg-gray-50 flex items-center justify-between group transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <span>{link.label}</span>
                <span className="text-gray-300 group-hover:text-yellow-500 transition-colors">→</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Branding */}
          <div className="absolute bottom-10 w-full text-center">
             <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Astro App v1.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;