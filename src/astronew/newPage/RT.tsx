import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Wallet, 
  Star, 
  Sparkles, 
  CreditCard, 
  Landmark, 
  CheckCircle2, 
  Circle 
} from 'lucide-react';

const WalletTopUp = () => {
  const [selectedPack, setSelectedPack] = useState(2); // Default to "Most Popular"
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const creditPacks = [
    { id: 1, credits: 100, bonus: 0, price: 99, tag: null },
    { id: 2, credits: 500, bonus: 50, price: 499, tag: "Most Popular" },
    { id: 3, credits: 1000, bonus: 150, price: 899, tag: "Best Value" },
    { id: 4, credits: 2500, bonus: 500, price: 1999, tag: null },
  ];

  const currentPack = creditPacks.find(p => p.id === selectedPack);

  return (
    <div className="bg-[#f8f7f5] dark:bg-[#221910] min-h-screen text-[#1c140d] font-['Plus_Jakarta_Sans']">
      <div className="relative flex flex-col w-full max-w-[430px] mx-auto bg-[#f8f7f5] dark:bg-[#221910] pb-40">
        
        {/* Top App Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 backdrop-blur-md bg-white/80 dark:bg-[#221910]/80">
          <button className="flex items-center justify-center rounded-full size-10 text-[#1c140d] dark:text-white hover:bg-black/5">
            <ArrowLeft size={20} />
          </button>
          <h2 className="flex-1 pr-10 text-lg font-bold tracking-tight text-center dark:text-white">Wallet Top-Up</h2>
        </div>

        {/* Current Balance */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between p-5 bg-white border border-orange-100 dark:bg-[#2d2218] rounded-xl shadow-sm dark:border-orange-900/30">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Balance</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="text-[#f48c25] fill-[#f48c25]" size={24} />
                <h3 className="text-2xl font-bold leading-none dark:text-white">45 Credits</h3>
              </div>
            </div>
            <div className="p-2 rounded-full bg-[#f48c25]/10">
              <Wallet className="text-[#f48c25]" size={24} />
            </div>
          </div>
        </div>

        {/* Refer & Earn Banner */}
        <div className="px-4 py-4">
          <div className="relative flex items-stretch justify-between gap-4 p-5 overflow-hidden shadow-lg rounded-xl bg-gradient-to-br from-[#f48c25] to-[#ffb366]">
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-lg font-bold leading-tight text-white">Refer & Earn</p>
                <p className="text-sm font-medium leading-snug text-white/90 max-w-[180px]">
                  Invite friends and get 50 credits for your rituals!
                </p>
              </div>
              <button className="flex items-center justify-center h-9 px-4 bg-white text-[#f48c25] text-sm font-bold rounded-lg shadow-sm active:scale-95 transition-transform w-fit">
                Refer Now
              </button>
            </div>
            <Sparkles className="absolute right-[-10px] top-[-10px] opacity-20 text-white" size={120} />
          </div>
        </div>

        {/* Pack Selection Header */}
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-lg font-bold tracking-tight dark:text-white">Select Credit Pack</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fuel your spiritual journey</p>
        </div>

        {/* Credits Grid */}
        <div className="grid grid-cols-2 gap-4 p-4">
          {creditPacks.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setSelectedPack(pack.id)}
              className={`relative bg-white dark:bg-[#2d2218] rounded-xl p-4 flex flex-col items-center justify-center border-2 transition-all active:scale-95 shadow-sm
                ${selectedPack === pack.id ? 'border-[#f48c25]' : 'border-transparent dark:border-gray-800'}`}
            >
              {pack.tag && (
                <div className={`absolute -top-3 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider 
                  ${pack.tag === 'Best Value' ? 'bg-[#e67e22]' : 'bg-[#f48c25]'}`}>
                  {pack.tag}
                </div>
              )}
              <Star className={`mb-2 ${selectedPack === pack.id ? 'text-[#f48c25] fill-[#f48c25]' : 'text-gray-400'}`} size={24} />
              <p className="text-xl font-bold leading-tight dark:text-white">{pack.credits}</p>
              <p className={`text-xs font-medium mb-3 ${pack.bonus > 0 ? 'text-[#f48c25] font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                {pack.bonus > 0 ? `+ ${pack.bonus} Bonus` : 'Credits'}
              </p>
              <div className={`w-full py-2 rounded-lg text-center font-bold text-sm 
                ${selectedPack === pack.id ? 'bg-[#f48c25] text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>
                ₹{pack.price}
              </div>
            </button>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="px-4 pt-6 pb-4">
          <h3 className="mb-4 text-base font-bold tracking-tight dark:text-white">Payment Methods</h3>
          <div className="space-y-3">
            <PaymentOption 
              id="upi" 
              active={paymentMethod === 'upi'} 
              onClick={setPaymentMethod}
              icon={<div className="flex items-center justify-center h-6 overflow-hidden rounded w-10 bg-gray-100 dark:bg-gray-700">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI6V_kTq4KbObfgXN12YsnQv27XM6h_K_egPAGq85PxrLSjbhgs5IS-DYGnHYHl1INUkl7gN5i-sLG10rBHvhAV01oPOhyVNzqbWrzGBDJrD2-Y5Zu202dg4HnRR1QSgN8O1ATBqRp8fdjyV0NaNkdsdLV_r18LcuCfm6oorYQsfpVOzqUYLg5bH_g5qvjmqwP2U_AW1HG5Y0owW7IlxzRAzQS_xbAnhUyRO3FH0t70K8oQm8yM6HPZWHXBF8RszEWjdZpFSbNglur" alt="UPI" className="object-contain size-full" />
              </div>}
              label="UPI (GPay, PhonePe, Paytm)"
            />
            <PaymentOption 
              id="card" 
              active={paymentMethod === 'card'} 
              onClick={setPaymentMethod}
              icon={<CreditCard size={20} className="text-gray-400" />}
              label="Cards (Visa, Mastercard, RuPay)"
            />
            <PaymentOption 
              id="net" 
              active={paymentMethod === 'net'} 
              onClick={setPaymentMethod}
              icon={<Landmark size={20} className="text-gray-400" />}
              label="Netbanking"
            />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white/90 dark:bg-[#2d2218]/90 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 p-4 pb-8 z-20">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Total Amount</span>
              <span className="text-xl font-bold dark:text-white">₹{currentPack.price}.00</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#f48c25]">{currentPack.credits + currentPack.bonus} Credits Total</span>
            </div>
          </div>
          <button className="w-full bg-[#f48c25] hover:bg-[#e67e22] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 dark:shadow-none transition-colors active:scale-[0.98]">
            Proceed to Pay
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentOption = ({ id, active, onClick, icon, label }) => (
  <button 
    onClick={() => onClick(id)}
    className="flex items-center w-full gap-4 p-4 bg-white border border-gray-100 dark:bg-[#2d2218] rounded-xl shadow-sm dark:border-gray-800"
  >
    {icon}
    <div className="flex-1 text-left">
      <p className="text-sm font-bold dark:text-white">{label}</p>
    </div>
    {active ? (
      <CheckCircle2 className="text-[#f48c25]" size={24} />
    ) : (
      <Circle className="text-gray-300" size={24} />
    )}
  </button>
);

export default WalletTopUp;