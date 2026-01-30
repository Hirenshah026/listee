import { HomeIcon, ChatBubbleOvalLeftIcon, VideoCameraIcon, PhoneIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const role = localStorage.getItem("role");
  
  const tabs = [
    { label: "Home", icon: HomeIcon, path: "/astro/home" },
    { label: "Chat", icon: ChatBubbleOvalLeftIcon, path: role === "astro" ? "/astro/chat/user" : "/astro/list" },
    { label: "Live", icon: VideoCameraIcon, path: role === "astro" ? "/astro/live" : "/astro/live/user" },
    { label: "Call", icon: PhoneIcon, path: "/call" },
    { label: "Remedies", icon: SparklesIcon, path: "/remedies" },
  ];

  return (
    <div className="w-full bg-yellow-400 flex justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.1)] rounded-t-2xl z-[100] h-[65px] min-h-[65px] items-center border-t border-yellow-500/20 flex-none">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <Link key={tab.label} to={tab.path} className="flex flex-col items-center justify-center flex-1 h-full relative">
            <Icon className={`w-5 h-5 ${isActive ? "text-black" : "text-gray-800"}`} />
            <span className={`text-[10px] mt-0.5 font-bold ${isActive ? "text-black" : "text-gray-800"}`}>{tab.label}</span>
            {isActive && <div className="absolute bottom-1 w-6 h-1 bg-black rounded-full"></div>}
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;