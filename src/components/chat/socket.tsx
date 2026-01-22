import { io } from "socket.io-client";

// Space ko remove kar diya gaya hai aur connection options optimize kiye hain
const API_URL = "https://listee-backend.onrender.com";
const socket = io(API_URL, {
  // Render par 'websocket' priority dena sabse zaroori hai
  transports: ["websocket", "polling"], 
  withCredentials: true, // Spelling fix ki gayi hai
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 20, // Live stream ke liye thoda zyada rakha hai
  reconnectionDelay: 1000,
  timeout: 20000, // Connection timeout
});

export default socket;




