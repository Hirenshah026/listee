import { io } from "socket.io-client";

const socket = io("http://10.184.233.180:5000", {
  autoConnect: false
});

export default socket;
