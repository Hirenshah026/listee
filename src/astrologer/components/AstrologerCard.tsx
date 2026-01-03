import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { Astrologer } from "../types/astrologer";
import { useNavigate } from "react-router-dom";

interface Props {
  astrologer: Astrologer;
}

const AstrologerCard: React.FC<Props> = ({ astrologer }) => {
  const navigate = useNavigate();

  const handleFreeChat = () => {
    navigate("/astro/chat", {
      state: { astrologer }
    });
  };

  return (
    <div className="bg-white rounded-xl p-3 flex gap-3 shadow-sm">
      <div className="relative">
        <img
          src={astrologer.image ?? "/banners/astrouser.jpg"}
          alt={astrologer.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <CheckBadgeIcon className="w-5 h-5 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
      </div>

      <div className="flex-1">
        <h3 className="font-semibold">{astrologer.name}</h3>
        <p className="text-xs text-gray-500">{astrologer.skills}</p>
        <p className="text-xs text-gray-500">{astrologer.languages}</p>
        <p className="text-xs text-gray-500">
          Exp - {astrologer.experience ?? ""}
        </p>

        <div className="text-xs text-gray-400 mt-1">
          ⭐⭐⭐⭐⭐ {astrologer.orders} orders
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <span className="font-semibold text-sm">{astrologer.price}</span>
        <button
          onClick={handleFreeChat}
          className="border border-green-500 text-green-600 px-3 py-1 rounded-full text-xs font-medium"
        >
          Free Chat
        </button>
      </div>
    </div>
  );
};

export default AstrologerCard;
