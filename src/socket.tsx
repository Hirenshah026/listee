import { io } from "socket.io-client";

const socket = io("https://listee-backend.onrender.com", {
  transports: ["websocket"],
  autoConnect: false, // 🔴 VERY IMPORTANT
});

export default socket;
