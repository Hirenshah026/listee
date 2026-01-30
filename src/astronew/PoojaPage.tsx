import React from 'react';
import { Languages, Users, ArrowRight, Calendar, MapPin } from 'lucide-react';
import BottomNav from './components/BottomNavNew';

const PoojaPage = () => {
  const poojas = [
    { id: 1, title: "Kaal Sarp Dosh Nivaran", price: "5100", location: "Trimbakeshwar", img: "https://images.unsplash.com/photo-1609347744403-2306e8a9ae01?w=300" },
    { id: 2, title: "Maha Lakshmi Pujan", price: "2100", location: "At Home / Online", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=300" },
  ];

  return (
    <div className="bg-gray-100 flex justify-center min-h-screen">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative flex flex-col pb-32">
        
        <header className="bg-orange-600 px-5 pt-8 pb-10 rounded-b-[40px] text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-black mb-2">Book a Pooja</h1>
            <p className="text-orange-100 text-xs font-bold">Perform Vedic rituals by certified Pandits</p>
          </div>
          <Languages className="absolute -right-4 -bottom-4 text-orange-500/30" size={120} />
        </header>

        <main className="px-4 -mt-6 space-y-6 z-20">
          <div className="bg-white rounded-3xl p-4 shadow-xl border border-orange-100 flex justify-around text-center">
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Booked</p><p className="font-black text-orange-600">12k+</p></div>
            <div className="w-px bg-slate-100"></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Pandits</p><p className="font-black text-orange-600">500+</p></div>
            <div className="w-px bg-slate-100"></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Cities</p><p className="font-black text-orange-600">50+</p></div>
          </div>

          <h3 className="font-black text-slate-800 text-lg px-2">Popular Rituals</h3>
          
          <div className="space-y-4 pb-4">
            {poojas.map((p) => (
              <div key={p.id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm group">
                <div className="relative h-40">
                  <img src={p.img} className="w-full h-full object-cover" alt="Pooja" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h4 className="text-white font-bold text-lg">{p.title}</h4>
                    <p className="text-orange-300 text-[10px] font-bold flex items-center gap-1"><MapPin size={10}/> {p.location}</p>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Starting from</p>
                    <p className="text-xl font-black text-slate-800">₹{p.price}</p>
                  </div>
                  <button className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-orange-200 flex items-center gap-2">
                    BOOK NOW <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <BottomNav activeTab="pooja" />
      </div>
    </div>
  );
};

export default PoojaPage;