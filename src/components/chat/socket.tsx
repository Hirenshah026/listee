import { io } from "socket.io-client";

// Space ko remove kar diya gaya hai aur connection options optimize kiye hain
const API_URL = "https://listee-backend.onrender.com";
const socket = io(API_URL, {
  transports: ["polling","websocket"],
  withCredentials:true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

export default socket;



