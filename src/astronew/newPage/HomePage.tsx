import React, { useState } from 'react';
import { 
  Search, 
  Mic, 
  Wallet, 
  Bell, 
  BookOpen, 
  PlayCircle, 
  Heart, 
  Headphones, 
  Home, 
  MessageCircle, 
  Video, 
  Phone, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

const SpiritualStories = () => {
  const [activeTab, setActiveTab] = useState('All Stories');

  const categories = ['All Stories', 'Kathas', 'Ganesha', 'Lord Krishna', 'Devi Maa'];
  
  const popularStories = [
    { id: 1, title: 'Makhan Chor Krishna', subtitle: 'Leelas of Bal Krishna', time: '12 Mins', type: ['read', 'audio'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7w2MA8dPob_aZXb9IdoYpDPRgoEVdZV4nDWMW0HGZMDliMTfVBylrWFR6r5Obk0w3W3frAGGmOFs4zRT8t342hF5Vo0yw0tMB3z_fu0UvVxXdhiBQNCUb696io5qetpc4L8BUokDx1CnmaZICR_7SyHtWLF31gzLg01xEinUwLxXDI-UdH5p5-1COoVYDa8ErtaV8gmpPR6cYpU6igZGAEDgFg8VafZQWekw5vQdUlpimOsvRifq7gZDtahQSjRBHZU4LPnHp4pI', liked: false },
    { id: 2, title: 'Ganesh Janma Katha', subtitle: 'Birth of the Elephant God', time: '8 Mins', type: ['read'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAjsC8rv-k8TE7zL5iJJn8dMqEA_Ab5DD2zg-lEoqN4n6k3_Ul9_IfU0rmoUpOycxBRsosYQVSJCZJpw2eHBOQ6pSZBn7sxNJpXdNeepYvjaBlWO27aUsJPxF3kiDObytPZlR98_ljbfDWB-0nBlzIVpD9FY0Pq1RYw9Bm47rx8dJ9zixkaqNqxoAueQDDPIhp33l20bxnvk2jynIrwVJxV7pqYGz5Aw3sxpwTNNRHiBzbCaf6Ayw-xUTV54qeOGp1Oa15ocOGNoY', liked: false },
    { id: 3, title: 'The Exile of Rama', subtitle: 'Ramayana Chronicles', time: '25 Mins', type: ['read', 'audio'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgluSI7f75fy4NAc8dk6WOI6dmKqfF5apP0Zv4NVQodRP7qzJQqc-SD-5EZWr8qF6GBbJPA_ucj1QDa6LZXXBTu2Zp_rjv7zyV4yj2Msj0YWbTslzZ5-zqtqbR1JJVbSLQvAxCm2AwwAyccg3m_ta-r4W_GY2kLlBxjLPD14-A8TzbEPaM8G8nDTSJQ6ixmFnKR0sN53QgjpqlQVCPw0N6dro_7R-Q5qWbZiKuAzqD8-C5nVmI1yFu8RqwWax6Syz2PWVKjbwC1lg', liked: false },
    { id: 4, title: "Hanuman's Devotion", subtitle: 'Stories of Bajrang Bali', time: '15 Mins', type: ['read', 'audio'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxOXhCgqB0Ob8MZVd8RN3H_5XpzhFWLgfqyt7tN5GiIPtlz74kdmwORPEH_UvG2Ko0UfkGGiRsDLS1QVm55JOy-iaJdXc91LScYI1Ydn6gua6pp-O68qv92Q5ZCtyguRZ9EsZJfiMmlQX2IHfkCNw_w_SeXi1wm9fld_G42Bo6kxyUTA0fkGSe5ej3Pgg5QsTP89jsbotwvUqt5J1iiYloLTDpgAyJ5PlxC23_kdf9N2zXaf_4D0zFlgKkIA1FVXGQsZHwk7lBjsI', liked: true },
  ];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 min-h-screen pb-32 font-['Outfit']">
      
      {/* Header Section */}
      <header className="bg-[#F15A24] pt-12 pb-8 px-5 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#F15A24] font-bold shadow-md">A</div>
            <div>
              <p className="text-[10px] text-white/80 uppercase tracking-widest leading-none">Daily Darshan</p>
              <h1 className="text-xl font-bold text-white tracking-tight uppercase">Listee Astro</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/30 backdrop-blur-sm">
              <Wallet size={14} className="text-white" />
              <span className="text-white font-semibold text-sm">₹150</span>
            </div>
            <div className="relative">
              <Bell size={24} className="text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#F15A24]">2</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 relative z-10">
          <div className="relative">
            <input 
              className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-12 shadow-xl focus:ring-2 focus:ring-orange-300 text-slate-700 dark:text-slate-200" 
              placeholder="Search deities, kathas or topics..." 
              type="text" 
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Mic className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F15A24]" size={20} />
          </div>
        </div>
      </header>

      <main className="px-5 mt-6">
        {/* Featured Story */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Story of the Day</h2>
          <span className="text-[#F15A24] text-sm font-medium cursor-pointer">View All</span>
        </div>
        
        <div className="relative w-full h-56 rounded-3xl overflow-hidden shadow-xl mb-8 group">
          <img alt="Shiva" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB7iiM01oQ-W2r3nkwjSs9jdugJxFM-ov4CF2ISbXqFRJqdgk7TrSFR7HMjGH8uNTu_hfbkIjiQh7f2k1EVMzFGe17mItDh1VZOuu6COAW3jsxeOgIUK_zwVXDTpH1iLEV8fTLBgWrjBOmNMd3Z2U3CKLbyF7US2Kngk_M5Kj5o7cZ0_a2DFscBw_5mb_4XSNJJjmqV8Sv7k7lFiTaa3zitUI3raYMNXTM80PMKVhNg55j4e-RoakVyonUt5VpQBujfS_TwhDkvxI" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-5 w-full">
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Most Read</span>
            <h3 className="text-white text-xl font-bold mt-2">The Eternal Dance of Shiva</h3>
            <p className="text-white/80 text-sm mt-1 line-clamp-1">Exploring the cosmic significance of Tandava and its rhythms.</p>
            <div className="flex items-center gap-4 mt-3">
              <button className="bg-white text-[#F15A24] px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
                <BookOpen size={16} /> Read Now
              </button>
              <button className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
                <PlayCircle size={16} /> Listen
              </button>
            </div>
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 -mx-5 px-5">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                activeTab === cat 
                ? 'bg-[#F15A24] text-white shadow-md shadow-orange-200 dark:shadow-none' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Popular Stories Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Popular Stories</h2>
          <button className="flex items-center gap-1 text-[#F15A24]">
            <span className="text-sm font-medium">Filter</span>
            <SlidersHorizontal size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {popularStories.map((story) => (
            <div key={story.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 active:scale-[0.98] transition-transform">
              <div className="relative h-32">
                <img alt={story.title} className="w-full h-full object-cover" src={story.img} />
                <button className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-full shadow-sm">
                  <Heart size={14} className={story.liked ? "fill-red-500 text-red-500" : "text-[#F15A24]"} />
                </button>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-sm line-clamp-1">{story.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">{story.subtitle}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 dark:border-slate-700">
                  <div className="flex gap-2">
                    {story.type.includes('read') && <BookOpen size={14} className="text-slate-400" />}
                    {story.type.includes('audio') && <Headphones size={14} className="text-[#F15A24]" />}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{story.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Poems Section */}
        <div className="mt-8 mb-4 font-bold text-lg">Hindi Poems & Dohe</div>
        <div className="space-y-4">
          <PoemCard title="Kabir Ke Dohe" line="Kaisi karni kar gaya, aisi kare na koye..." tag="Philosophy" type="Listen" />
          <PoemCard title="Ramdhari Singh 'Dinkar'" line="Yachna nahi, ab rann hoga..." tag="Spirituality" type="Read" />
        </div>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-3 pb-8 z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <NavItem icon={<Home />} label="Home" />
          <NavItem icon={<MessageCircle />} label="Chat" />
          
          <div className="relative -top-10">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full p-1 shadow-xl">
              <div className="w-full h-full bg-[#F15A24] rounded-full flex items-center justify-center text-white shadow-inner">
                <Video size={28} />
              </div>
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#F15A24] uppercase">Live</span>
          </div>

          <NavItem icon={<Phone />} label="Call" />
          <NavItem icon={<Sparkles />} label="Stories" active />
        </div>
      </nav>
    </div>
  );
};

// Sub-components
const PoemCard = ({ title, line, tag, type }) => (
  <div className="bg-orange-50 dark:bg-slate-800/50 p-4 rounded-2xl border-l-4 border-[#F15A24] active:bg-orange-100 transition-colors cursor-pointer">
    <h5 className="font-bold text-sm">{title}</h5>
    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 italic leading-relaxed">"{line}"</p>
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {type === 'Listen' ? <PlayCircle size={16} className="text-[#F15A24]" /> : <BookOpen size={16} className="text-[#F15A24]" />}
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{type === 'Listen' ? 'Listen to meaning' : 'Read Poem'}</span>
      </div>
      <span className="text-[10px] text-[#F15A24] bg-[#F15A24]/10 px-2 py-0.5 rounded font-bold uppercase">{tag}</span>
    </div>
  </div>
);

const NavItem = ({ icon, label, active = false }) => (
  <button className="flex flex-col items-center gap-1 group">
    <div className={`${active ? 'text-[#F15A24]' : 'text-slate-400'} group-hover:text-[#F15A24] transition-colors`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-tighter ${active ? 'text-[#F15A24]' : 'text-slate-400'}`}>
      {label}
    </span>
  </button>
);

export default SpiritualStories;