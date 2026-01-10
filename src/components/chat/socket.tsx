import { io } from "socket.io-client";

const socket = io("http://10.18.209.180:5000", {
   transports: ["websocket"],
  autoConnect: false
});

export default socket;
