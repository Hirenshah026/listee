import { io } from "socket.io-client";

// Space ko remove kar diya gaya hai aur connection options optimize kiye hain
const API_URL = "https://aqua-goat-506711.hostingersite.com";
const socket = io(API_URL, {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;

