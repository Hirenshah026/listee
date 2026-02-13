import React from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  Sparkles, 
  Info, 
  Ear, 
  PersonStanding, 
  UserPlus, 
  Plus, 
  Minus 
} from 'lucide-react';

const DharmaWallet = () => {
  const earnActions = [
    { id: 1, title: "Listen to 5 Mantras", progress: "2/5", reward: "+10", icon: <Ear size={20} /> },
    { id: 2, title: "Complete Daily Sadhana", progress: "Maintain your streak", reward: "+25", icon: <PersonStanding size={20} /> },
    { id: 3, title: "Invite a Friend", progress: "Spread the wisdom", reward: "+100", icon: <UserPlus size={20} /> },
  ];

  const transactions = [
    { id: 1, title: "Daily Visit Bonus", date: "Today, 09:30 AM", amount: "+5", type: "credit" },
    { id: 2, title: "Astrology Consultation", date: "Yesterday, 04:15 PM", amount: "-500", type: "debit" },
    { id: 3, title: "Mantra Completion", date: "May 15, 08:45 AM", amount: "+10", type: "credit" },
    { id: 4, title: "Wallet Top-up", date: "May 14, 11:20 AM", amount: "+1000", type: "credit" },
  ];

  return (
    <div className="bg-[#f8f7f5] dark:bg-[#221910] font-['Plus_Jakarta_Sans'] text-[#1c140d] dark:text-[#fcfaf8] min-h-screen">
      <div className="relative flex h-auto w-full max-w-[480px] mx-auto flex-col overflow-x-hidden">
        
        {/* Top App Bar */}
        <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-[#f8f7f5]/80 dark:bg-[#221910]/80 backdrop-blur-md z-10">
          <button className="flex items-center justify-start size-12 dark:text-[#fcfaf8]">
            <ArrowLeft size={24} />
          </button>
          <h2 className="flex-1 text-lg font-bold tracking-tight">Dharma Wallet & Rewards</h2>
          <button className="flex items-center justify-end size-12 dark:text-[#fcfaf8]">
            <HelpCircle size={20} />
          </button>
        </header>

        {/* Wallet Balance Card */}
        <section className="p-4">
          <div className="flex flex-col items-stretch justify-start rounded-xl shadow-sm bg-white dark:bg-[#2d2218] border border-[#e8dbce]/30 overflow-hidden">
            <div 
              className="w-full bg-center bg-no-repeat aspect-[21/9] bg-cover relative" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDv_qz9tY7vaim6GMYlt25xsMuRj9ei7oDJAyj1QfG6bnaQEYynLRsOsT5Xknu_ZJckroYuhWVx9iDVmM3yACs60BCrOuw_gAOwYn2x14oPZZCXNrpJUt3Q-GsQFbiUJm9oU-iReb5rD16VuVawNWG8geHrJvXgrCICTSAp16rfMMz7c_uvbrvJz7v1_xVnNoeqwwcB2Wib2FxVZrOh5cKdP_ddyd39ddmGSf0383Y02NiD0idgzcMmOk4TRO6WOPLgXMoT0yn53sBv")' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#2d2218] to-transparent"></div>
            </div>
            <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 p-5 -mt-8 relative z-10">
              <p className="text-[#9c7349] dark:text-[#c4a484] text-sm font-medium uppercase tracking-wider">Total Balance</p>
              <div className="flex items-end gap-3 justify-between">
                <p className="text-[#1c140d] dark:text-white text-4xl font-extrabold leading-tight">
                  1,250 <span className="text-lg font-semibold opacity-70">Credits</span>
                </p>
                <button className="flex min-w-[120px] items-center justify-center rounded-full h-10 px-5 bg-[#f48c25] text-white text-sm font-bold shadow-lg shadow-[#f48c25]/20 hover:scale-105 active:scale-95 transition-transform">
                  Recharge Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Spiritual Journey Tier */}
        <section className="px-4 py-2">
          <div className="bg-white dark:bg-[#2d2218] p-5 rounded-xl border border-[#e8dbce]/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#f48c25]" />
                <h3 className="text-base font-bold">Spiritual Tier: <span className="text-[#f48c25]">Sadhak</span></h3>
              </div>
              <p className="text-[#9c7349] dark:text-[#c4a484] text-xs font-semibold">Next: Yogi</p>
            </div>
            <div className="h-3 w-full rounded-full bg-[#e8dbce] dark:bg-[#3d2e21] overflow-hidden mb-2">
              <div className="h-full rounded-full bg-gradient-to-r from-[#f48c25] to-[#ffb347]" style={{ width: "65%" }}></div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[#9c7349] dark:text-[#c4a484] text-xs font-medium">350 more credits to level up</p>
              <Info size={14} className="text-[#9c7349]" />
            </div>
          </div>
        </section>

        {/* Ways to Earn */}
        <section className="px-4 pt-6 pb-2">
          <h3 className="text-lg font-bold tracking-tight">Ways to Earn Credits</h3>
        </section>
        <div className="flex flex-col gap-3 px-4">
          {earnActions.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#2d2218] rounded-xl border border-[#e8dbce]/20">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-[#f48c25]/10 flex items-center justify-center text-[#f48c25]">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-sm dark:text-white">{item.title}</p>
                  <p className="text-[#9c7349] dark:text-[#c4a484] text-xs">{item.progress}</p>
                </div>
              </div>
              <span className="text-[#f48c25] font-bold text-sm">{item.reward}</span>
            </div>
          ))}
        </div>

        {/* Transaction History */}
        <section className="px-4 pt-6 pb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">Transaction History</h3>
          <button className="text-[#f48c25] text-sm font-bold">See All</button>
        </section>
        
        <div className="flex flex-col px-4 pb-8">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-4 border-b border-[#e8dbce]/20 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-full flex items-center justify-center ${
                  tx.type === 'credit' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {tx.type === 'credit' ? <Plus size={18} /> : <Minus size={18} />}
                </div>
                <div>
                  <p className="font-bold text-sm dark:text-white">{tx.title}</p>
                  <p className="text-[#9c7349] dark:text-[#c4a484] text-xs">{tx.date}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${
                tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'dark:text-white'
              }`}>
                {tx.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DharmaWallet;