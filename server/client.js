import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
    autoConnect:false,
   
});
socket.auth = {username: 'electron'}
socket.connect();
socket.on("connect_error", (message) => {
    console.log(message);
});