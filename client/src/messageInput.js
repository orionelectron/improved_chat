import React, { useState, useContext, useEffect } from 'react';
import './messageInput.module.css';
import SocketContext from "./socketContext.js";

function MessageInput(){
    const [message, setMessage] = useState("");
    const socket = useContext(SocketContext);
    useEffect(() => {
        socket.emit("fetch_messages");
        socket.on("messages", () => {
            console.log("Received Initial messages!!");
        });
    },[]);
    const preventDefault = (e) => {
        e.preventDefault();
        console.log("message submitted");
        //socket.emit("message", {message, to: props.friend, from: socket.username});
        setMessage('');

    }
    const onMessageChanged = (e) => {
        setMessage(e.target.value);
    }
    return (
        <form onSubmit={preventDefault}> 
            <input type="text" placeholder="Message" value={message} onChange={onMessageChanged}/>
            <button> Send Message </button>
        </form>
    );
}

export default MessageInput;