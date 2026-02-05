import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Bell, Menu, X, User, LogOut, LogIn } from "lucide-react"; 
import useUser from "../../hooks/useUser";

const Header = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useUser();

  // Token check - Asli login indicator
  const isLoggedIn = localStorage.getItem("token") ? true : false;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); 
    setSidebarOpen(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      <header className="bg-orange-600 px-5 pt-5 pb-4 rounded-b-[40px] sticky top-0 z-50 shadow-lg w-full max-w-[450px] mx-auto">
        <div className="flex justify-between items-center text-white mb-2">
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-orange-400 text-xl cursor-pointer overflow-hidden shadow-inner"
              onClick={() => setSidebarOpen(true)}
            >
              {isLoggedIn && user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : <User size={20} />}
            </div>
            
            <div>
              <p className="text-[10px] opacity-80 font-bold uppercase tracking-tight">Daily Darshan</p>
              <h1 className="text-lg font-extrabold leading-none tracking-tight uppercase">
                {isLoggedIn ? (user?.name || "LISTEE ASTRO") : "WELCOME GUEST"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-orange-500/50 px-3 py-1.5 rounded-full border border-orange-400/30 flex items-center gap-2 shadow-sm">
              <Wallet size={14} className="text-orange-100" />
              <span className="text-xs font-bold">₹{isLoggedIn ? (user?.walletBalance || "0") : "0"}</span>
            </div>
            <div className="relative">
              <Bell size={20} className="text-white cursor-pointer" />
              {isLoggedIn && <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full">2</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 flex justify-center z-[200] ${sidebarOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setSidebarOpen(false)} />

        <div className={`relative h-full bg-white shadow-2xl w-full max-w-[450px] transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-6 flex justify-between items-center bg-orange-600 text-white rounded-br-[40px]">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-orange-600 text-2xl font-bold shadow-lg overflow-hidden border-2 border-orange-400">
                  {isLoggedIn && user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : <User size={28} />}
               </div>
               <div>
                  <h2 className="font-extrabold text-lg leading-tight uppercase">{isLoggedIn ? (user?.name || "Guest") : "Home"}</h2>
                  <p className="text-[10px] uppercase font-bold text-orange-200 tracking-widest">{role ? `${role} mode` : "Select Role First"}</p>
               </div>
            </div>
            <button onClick={() => setSidebarOpen(false)}><X size={24} /></button>
          </div>

          <nav className="flex flex-col p-4 pt-8 gap-2">
            {isLoggedIn ? (
              <>
                <Link to={role === "astro" ? "/astro/profile" : "/user/profile"} className="text-gray-700 font-bold p-4 rounded-2xl hover:bg-orange-50 flex justify-between" onClick={() => setSidebarOpen(false)}>Profile <span>→</span></Link>
                <button onClick={handleLogout} className="text-red-600 font-bold p-4 rounded-2xl hover:bg-red-50 flex justify-between items-center">Logout <LogOut size={18}/></button>
              </>
            ) : (
              <Link to={role === "astro" ? "/astro/login" : "/user/login"} className="text-green-600 font-bold p-4 rounded-2xl hover:bg-green-50 flex justify-between items-center" onClick={() => setSidebarOpen(false)}>{role === "astro" ? "Astro Login" : "User Login"} <LogIn size={18}/></Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;