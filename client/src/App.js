import React, { useState, useEffect } from "react";
import styles from './App.module.css';
import { ReactDOM } from "react";
import socket from './socket.js';
import Friendlist from "./FriendList.js";
import SocketContext from "./socketContext.js";
import SelectUsername from "./SelectUsername.js";
import MessageInput from "./messageInput.js";
import MessageList from "./messageList.js";

function App() {
    let session = localStorage.getItem("sessionID");
    
    
    const [hasUsername, setUsernameStatus] = useState(false);
    const ref = React.createRef();
    
    const onSubmitCallback = (e) => {
        e.preventDefault();
        const usernameValue = ref.current.value;
        socket.auth = {username: usernameValue};
        setUsernameStatus(true);
        //socket.connect();
        
    };
    
    useEffect(() => {
        if (session != null) {
            session = JSON.parse(session);
            console.log("Fetched session from browser", session)
            socket.auth = { session };
            setUsernameStatus(true);
            
    
        }
        socket.once("connect_error", (err) => {
            console.log("There was some error connecting with server!!", err);
            setUsernameStatus(false);
        })
        socket.once("session", (session) => {
            socket.auth = {session}
           // setUsername(session.username);
            console.log("session");
            localStorage.setItem("sessionID",JSON.stringify(session));
        })
        return () => {
            socket.disconnect();
        }
    }, []);


    if (!hasUsername) {
        return (
            <>
            <div className={styles.central}>
                <div className={styles.form_structure} >
                    <form  onSubmit={onSubmitCallback}>
                        <input className={styles.username_input} ref={ref} type="text" placeholder="Username" />
                        <button className={styles.username_button}> Set Username </button>
                    </form>
                </div>
            </div>
            </>
        )


    }
    
    return (
                <div className={styles.main_container}>
                    <div className={styles.friend_message_container}>
                        <Friendlist/>
                        <MessageList/>
                    </div>
                    <MessageInput/>
                </div>
                
                
       
   
    )

}

export default App;