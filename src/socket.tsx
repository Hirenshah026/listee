import { io } from "socket.io-client";

const socket = io("https://aqua-goat-506711.hostingersite.com", {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
