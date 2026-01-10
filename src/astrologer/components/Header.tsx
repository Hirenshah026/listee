// Header.js
import { useState } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import useUser from "../../hooks/useUser";

const Header = () => {
  const role = localStorage.getItem("role");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useUser();
  const menuLinks = [
    { label: "Profile", path: role === "chatuser" ? "/user/profile" : "/astro/profile" },
    { label: "Settings", path: "/astro/settings" },
    { label: "My Orders", path: "/astro/orders" },
    { label: loading ? "Logout" : "Login", path: "/astro/logout" },
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-yellow-300 px-4 py-3 flex items-center justify-between shadow-md max-w1-sm mx-auto w-full rounded-b-xl relative z-30">
        <div className="flex items-center gap-2">
          {/* User Icon */}
          <div
            className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            👤
          </div>
          
          <span className="font-medium text-gray-700">
            {loading ? "Hi..." : `Hi, ${user?.name || "User"}`}
          </span>
        </div>

        <div className="flex gap-4">
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-700" />
          <FunnelIcon className="w-6 h-6 text-gray-700" />
        </div>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 h-full bg-white shadow-lg transition-transform duration-300 z-50 max-w-sm w-full ${sidebarOpen ? "" : "hidden"}`}
        style={{
          left: "50%",
          transform: sidebarOpen
            ? "translateX(-50%)"
            : "translateX(-150%)", // hidden off screen
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="font-bold text-gray-800">Menu</h2>
          <button
            className="text-gray-700 font-bold text-xl"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col p-4 gap-3">
          {menuLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="text-gray-700 font-medium hover:text-black"
              onClick={() => setSidebarOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Header;
