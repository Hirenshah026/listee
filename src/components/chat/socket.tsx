import { io } from "socket.io-client";

const socket = io("https://listee-backend.onrender.com:5000", {
   transports: ["websocket"],
  autoConnect: false
});

export default socket;
