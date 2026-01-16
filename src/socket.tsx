import { io } from "socket.io-client";

const socket = io("https://listee-backend.onrender.com", {
  autoConnect: false
});

export default socket;
