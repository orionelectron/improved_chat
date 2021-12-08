import React, { useState, useContext, useEffect } from 'react';
import './messageInput.module.css';
import SocketContext from "./socketContext.js";

function MessageInput(props){
    const [message, setMessage] = useState("");
    const socket = useContext(SocketContext);
    
    const preventDefault = (e) => {
        e.preventDefault();
        const selectedID = props.selectedID
        
        console.log(props.selectedID);
        console.log("message submitted");
        socket.emit("private_message", {message, to: selectedID, from: socket.userID});
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