import { useEffect, useState } from "react";
import axios from "axios";
import useUser from "../../hooks/useUser";

type User = {
  _id: string;
  name: string;
};

type LastMessage = {
  text: string;
  createdAt: string;
};

type UserWithLastMsg = User & {
  lastMessage?: LastMessage;
};

type Props = {
  onSelect: (u: User | null) => void;
  selectedUser?: User | null;
};

export default function Sidebar({ onSelect, selectedUser }: Props) {
  const { user: loggedUser } = useUser();
  const CURRENT_USER_ID = loggedUser?._id;

  const [users, setUsers] = useState<UserWithLastMsg[]>([]);
  const [search, setSearch] = useState("");

  // ================= FETCH USERS + LAST MESSAGE =================
  useEffect(() => {
    if (!CURRENT_USER_ID) return;

    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://10.184.233.180:5000/api/doctors");
        if (!res.data.success) return;

        const usersList: User[] = res.data.doctors;

        // 🔥 Remove logged-in user and fetch last message
        const usersWithLastMsg = await Promise.all(
          usersList
            .filter((u) => u._id !== CURRENT_USER_ID)
            .map(async (u) => {
              try {
                const msgRes = await axios.get(
                  `http://10.184.233.180:5000/api/messages/last/${CURRENT_USER_ID}/${u._id}`
                );

                return {
                  ...u,
                  lastMessage: msgRes.data || undefined,
                };
              } catch {
                return u;
              }
            })
        );

        setUsers(usersWithLastMsg);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [CURRENT_USER_ID]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const sidebarClasses = selectedUser
    ? "hidden sm:flex w-full sm:w-[380px] flex-col bg-[#f8f9fa] border-r"
    : "flex w-full sm:w-[380px] flex-col bg-[#f8f9fa] border-r";

  const formatTime = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={sidebarClasses}>
      {/* HEADER */}
      <div className="h-16 bg-[#ededed] flex items-center px-4 font-semibold">
        Chats
      </div>

      {/* SEARCH */}
      <div className="p-2">
        <input
          className="w-full px-4 py-2 rounded-full border text-sm"
          placeholder="Search user"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* USER LIST */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((u) => {
          const isActive = selectedUser?._id === u._id;

          return (
            <div
              key={u._id}
              onClick={() => onSelect(u)}
              className={`flex items-center px-4 py-3 cursor-pointer
                ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`}
            >
              {/* AVATAR */}
              <div className="w-12 h-12 rounded-full bg-gray-400 mr-3 flex items-center justify-center text-white font-bold">
                {u.name.charAt(0).toUpperCase()}
              </div>

              {/* NAME + LAST MESSAGE */}
              <div className="flex-1">
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {u.lastMessage?.text || "No messages yet"}
                </div>
              </div>

              {/* TIME */}
              <div className="text-xs text-gray-400">
                {formatTime(u.lastMessage?.createdAt)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
