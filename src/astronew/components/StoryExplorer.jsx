import React, { useState } from 'react';
import { SlidersHorizontal, Heart, BookOpen, Headphones, SearchX } from 'lucide-react';

const StoryExplorer = () => {
  const [activeTab, setActiveTab] = useState('All Stories');

  const categories = ['All Stories', 'Kathas', 'Ganesha', 'Lord Krishna', 'Devi Maa'];
  
  const popularStories = [
    { id: 1, title: 'Makhan Chor Krishna', subtitle: 'Leelas of Bal Krishna', time: '12 Mins', type: ['read', 'audio'], img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmqCP6xQyFQ8tAM6CM_M4q8WVBpzHAC2VCoQf_Q_dEdw&s', liked: false },
    { id: 2, title: 'Ganesh Janma Katha', subtitle: 'Birth of the Elephant God', time: '8 Mins', type: ['read'], img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM_Y8s8sB4jtYGWN2B2jm4EXGt_I3HekVfyg&s', liked: false },
    { id: 3, title: 'The Exile of Rama', subtitle: 'Ramayana Chronicles', time: '25 Mins', type: ['read', 'audio'], img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5cYpgvTY4FqS_PGy7nH9Q9pALh75yyOE6FcSWvff_Pg&s', liked: false },
    { id: 4, title: "Hanuman's Devotion", subtitle: 'Stories of Bajrang Bali', time: '15 Mins', type: ['read', 'audio'], img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZ7W055dgSWHDKHx6u0gPrj986pAbdLEZ3Kc8S3wgz&s', liked: true },
  ];

  const filteredStories = activeTab === 'All Stories' 
    ? popularStories 
    : popularStories.filter(story => 
        story.title.toLowerCase().includes(activeTab.toLowerCase()) || 
        story.subtitle.toLowerCase().includes(activeTab.toLowerCase())
      );

  return (
    <div className="w-full"> 
      
      {/* Categories Scroller */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 -mx-4 px-4">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
              activeTab === cat 
              ? 'bg-[#F15A24] text-white shadow-lg shadow-orange-100' 
              : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Popular Stories</h2>
        <button className="flex items-center gap-1 text-[#F15A24]">
          <span className="text-sm font-medium">Filter</span>
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Grid or Empty State */}
      <div className="grid grid-cols-2 gap-4 mb-0">
        {filteredStories.length > 0 ? (
          filteredStories.map((story) => (
            <div key={story.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.98] transition-transform">
              <div className="relative h-28">
                <img alt={story.title} className="w-full h-full object-cover" src={story.img} />
                <button className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm">
                  <Heart size={12} className={story.liked ? "fill-red-500 text-red-500" : "text-[#F15A24]"} />
                </button>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-[13px] line-clamp-1 text-slate-800">{story.title}</h4>
                <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">{story.subtitle}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                  <div className="flex gap-1.5 text-slate-400">
                    {story.type.includes('read') && <BookOpen size={12} />}
                    {story.type.includes('audio') && <Headphones size={12} className="text-[#F15A24]" />}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{story.time}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* --- Empty State --- */
          <div className="col-span-2 py-12 flex flex-col items-center justify-center bg-white rounded-[32px] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
               <SearchX size={32} className="text-orange-300" />
            </div>
            <h3 className="text-slate-800 font-bold text-base">No Stories Found</h3>
            <p className="text-slate-400 text-[11px] mt-1 text-center px-8">
              Hum is category mein jald hi nayi kathayein jodne wale hain.
            </p>
            <button 
              onClick={() => setActiveTab('All Stories')}
              className="mt-5 bg-orange-50 text-[#F15A24] px-6 py-2 rounded-full text-xs font-bold active:scale-95 transition-all"
            >
              See All Stories
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryExplorer;