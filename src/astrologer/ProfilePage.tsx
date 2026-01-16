import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import useUser from "../hooks/useUser";

const ProfilePage = () => {
  const { user, loading } = useUser();

  if (loading) return <div className="h-screen flex items-center justify-center bg-white">Loading...</div>;

  return (
    <div className="flex justify-center bg-zinc-200 h-[100dvh] w-full overflow-hidden">
      <div className="w-full max-w-[450px] bg-white flex flex-col h-full relative shadow-2xl">
        
        <div className="flex-none z-50">
          <Header />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50 pb-6">
          <div className="p-4 mt-2 text-center">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
              <img
                src={user?.image || "/banners/astrouser.jpg"}
                className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400 shadow-md"
                alt="profile"
              />
              <h2 className="text-xl font-bold text-gray-800 mt-3">{user?.name || "User"}</h2>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">{user?.role || "Astrologer"}</p>

              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <div className="bg-orange-50 rounded-2xl py-3 border border-orange-100 text-center text-gray-800 font-bold">
                  Exp: {user?.experience || 5}y
                </div>
                <div className="bg-yellow-50 rounded-2xl py-3 border border-yellow-100 text-center text-gray-800 font-bold">
                  {user?.rating || 4.8} ⭐
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4 text-left">
              <h3 className="font-bold text-gray-800 mb-2">About Me</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{user?.about || "Expert in Astrology."}</p>
            </div>
          </div>
        </div>

        <div className="flex-none">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;