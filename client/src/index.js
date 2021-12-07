
import React from "react";
import  ReactDOM  from "react-dom";
import App from './App.js';
import socket from "./socket.js";
import SocketContext from "./socketContext.js";

ReactDOM.render(
<SocketContext.Provider value={socket}> 
    <App/>
</SocketContext.Provider>, document.getElementById("root"));

