import React, { useState, useContext, useEffect } from 'react';
import './messageInput.module.css';
import SocketContext from "./socketContext.js";

function MessageList(){
    const [messages, setMessages] = useState([]);
    const socket = useContext(SocketContext);
    useEffect(() => {
        socket.emit("fetch_messages");
        socket.on("messages", () => {
            console.log("Received Initial messages!!");
        });
    },[]);

    return (
        <div>
            <h1> Message list</h1>
        </div>
        
    )
}

export default MessageList;