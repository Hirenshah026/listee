import { useState } from "react";
import Sidebar from "../components/chat/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";

type User = {
  _id: string;
  name: string;
};

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="h-screen w-screen bg-[#eae6df] flex items-center justify-center">
      <div className="w-full h-full sm:w-[95%] sm:h-[95%] bg-white shadow-lg flex overflow-hidden rounded-lg">
        
        {/* SIDEBAR */}
        <div
          className={`
            ${selectedUser ? "hidden" : "flex"} 
            sm:flex
            w-full sm:w-[380px]
            h-full
            flex-col
          `}
        >
          <Sidebar onSelect={setSelectedUser} />
        </div>

        {/* CHAT WINDOW */}
        <div
          className={`
            ${selectedUser ? "flex" : "hidden"}
            sm:flex
            flex-1
            h-full
            flex-col
          `}
        >
          <ChatWindow
            user={selectedUser}
            onBack={() => setSelectedUser(null)}
          />
        </div>

      </div>
    </div>
  );
}
