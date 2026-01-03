import {
  HomeIcon,
  ChatBubbleOvalLeftIcon,
  VideoCameraIcon,
  PhoneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const tabs = [
    { label: "Home", icon: HomeIcon, path: "/astro/home" },
    { label: "Chat", icon: ChatBubbleOvalLeftIcon, path: role === "astro" ? "/astro/chat/user" : "/astro/list" },
    { label: "Live", icon: VideoCameraIcon, path: "/live" },
    { label: "Call", icon: PhoneIcon, path: "/call" },
    { label: "Remedies", icon: SparklesIcon, path: "/remedies" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-yellow-300 px-4 py-3 flex justify-around shadow-sm rounded-t-xl z-50 max-w-sm w-full">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <Link key={tab.label} to={tab.path} className="flex flex-col items-center px-2">
            <Icon className={`w-6 h-6 ${isActive ? "text-black-700" : "text-gray-700"}`} />
            <span className={`text-xs mt-1 font-medium ${isActive ? "text-black-700" : "text-gray-700"}`}>
              {tab.label}
            </span>
            {isActive && <div className="mt-1 w-2 h-2 rounded-full bg-black"></div>}
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
