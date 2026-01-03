import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import useUser from "../hooks/useUser";

const ProfilePage = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="max-w-sm mx-auto min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-sm mx-auto min-h-screen flex items-center justify-center">
        User not found
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-100 flex flex-col pb-24">

      {/* HEADER */}
      <Header />

      {/* PROFILE CARD */}
      <div className="p-4 mt-4">
        <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">

          {/* PROFILE IMAGE */}
          <img
            src={user.image || "/banners/astrouser.jpg"}
            className="w-24 h-24 rounded-full object-cover mb-4 border"
            alt="profile"
          />

          {/* NAME & ROLE */}
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {user.name || "Astrologer"}
          </h2>

          <p className="text-sm text-gray-500 mb-4 capitalize">
            {user.role || "Astrologer"}
          </p>

          {/* STATS */}
          <div className="w-full grid grid-cols-2 gap-4 text-center mb-4">
            <div className="bg-yellow-100 rounded-lg py-2">
              <p className="text-xs text-gray-600">Experience</p>
              <p className="font-semibold text-gray-800">
                {user.experience || 0} yrs
              </p>
            </div>

            <div className="bg-yellow-100 rounded-lg py-2">
              <p className="text-xs text-gray-600">Rating</p>
              <p className="font-semibold text-gray-800">
                {user.rating || 0} ⭐
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex w-full gap-3">
            <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold">
              Chat
            </button>
            <button className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold">
              Call
            </button>
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold text-gray-800 mb-2">About Me</h3>
          <p className="text-sm text-gray-600">
            {user.about ||
              "Experienced astrologer providing guidance in love, career, marriage and education."}
          </p>
        </div>
      </div>

      {/* REVIEWS (STATIC FOR NOW) */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold text-gray-800 mb-2">Reviews</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>⭐️⭐️⭐️⭐️⭐️ Very accurate predictions!</li>
            <li>⭐️⭐️⭐️⭐️⭐️ Helpful and friendly astrologer.</li>
            <li>⭐️⭐️⭐️⭐️⭐️ Highly recommend.</li>
          </ul>
        </div>
      </div>

      {/* FOOTER */}
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
