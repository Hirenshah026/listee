import { io } from "socket.io-client";

const socket = io("http://192.168.105.180:5000", {
   transports: ["websocket"],
  autoConnect: false
});

export default socket;
