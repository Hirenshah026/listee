import React from 'react';
import { 
  User, Wallet, History, Settings, 
  HelpCircle, LogOut, ChevronRight, 
  ShieldCheck, Bell, CreditCard, Camera 
} from 'lucide-react';
import BottomNav from './components/BottomNavNew';

const ProfilePage = () => {
  return (
    <div className="bg-gray-100 flex justify-center min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}} />

      <div className="w-full max-w-md bg-slate-50 min-h-screen relative flex flex-col pb-32">
        
        {/* --- 1. Top Header Profile Card --- */}
        <header className="bg-orange-600 px-5 pt-10 pb-16 rounded-b-[40px] relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-white">
            <div className="relative">
              <img 
                src="/banners/astrouser.jpg" 
                className="w-24 h-24 rounded-full border-4 border-white/30 shadow-2xl object-cover" 
                alt="User" 
              />
              <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full text-orange-600 shadow-lg cursor-pointer">
                <Camera size={16} />
              </div>
            </div>
            <h2 className="mt-4 text-xl font-extrabold">Rahul Sharma</h2>
            <p className="text-orange-100 text-xs font-bold">+91 98765 43210</p>
          </div>
          {/* Background Design */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-50"></div>
        </header>

        <main className="px-5 -mt-8 z-20 space-y-6">
          
          {/* --- 2. Wallet Quick Card --- */}
          <div className="bg-white rounded-3xl p-5 shadow-xl border border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Balance</p>
                <p className="text-xl font-black text-slate-800">₹150.00</p>
              </div>
            </div>
            <button className="bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-200">
              RECHARGE
            </button>
          </div>

          {/* --- 3. Menu Options --- */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Account Settings</h3>
            
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <MenuOption icon={<History size={20}/>} title="My Consultations" subtitle="Chat & Call history" />
              <MenuOption icon={<CreditCard size={20}/>} title="My Bookings" subtitle="Pooja & Ritual status" />
              <MenuOption icon={<Bell size={20}/>} title="Notifications" subtitle="Offers & Session alerts" />
              <MenuOption icon={<ShieldCheck size={20}/>} title="Privacy Policy" subtitle="Your data is safe with us" />
              <MenuOption icon={<HelpCircle size={20}/>} title="Support & Help" subtitle="24/7 Customer assistance" />
              <MenuOption icon={<Settings size={20}/>} title="Settings" subtitle="App preferences" isLast />
            </div>
          </div>

          {/* --- 4. Logout Button --- */}
          <button className="w-full bg-red-50 text-red-600 py-4 rounded-3xl font-black text-sm flex items-center justify-center gap-2 border border-red-100 active:scale-95 transition-all">
            <LogOut size={18} /> LOGOUT
          </button>

          <p className="text-center text-[10px] text-slate-300 font-bold">App Version 2.0.26</p>
        </main>

        <BottomNav  /> {/* Adjust active tab as needed */}
      </div>
    </div>
  );
};

// Sub-component for Menu Items
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

export default ProfilePage;