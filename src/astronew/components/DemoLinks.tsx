import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

const DemoLinks = ({ closeSidebar }) => {
  const links = [
    { path: "/n1", label: "Astrologer List" },
    { path: "/n2", label: "Dharma Wallet" },
    { path: "/n3", label: "Home Page" },
    { path: "/n4", label: "Live Discover" },
    { path: "/n5", label: "RT Section" },
    { path: "/n6", label: "User Profile" },
    { path: "/n7", label: "Wallet TopUp" },
    { path: "/n8", label: "Mantra" },
    { path: "/n9", label: "Mantra List" },
  ];

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase px-4 mb-2 tracking-widest">
        Demo Pages
      </p>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          onClick={closeSidebar}
          className="text-gray-700 font-bold p-3 rounded-xl hover:bg-orange-50 flex items-center gap-3 transition-all text-sm"
        >
          <LayoutGrid size={16} className="text-orange-500" />
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default DemoLinks;