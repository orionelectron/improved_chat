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
    let sessionID = localStorage.getItem("sessionID");
    const [hasUsername, setUsernameStatus] = useState(false);
    const [state, setState] = useState({selectedID: '', messages: []});
    const ref = React.createRef();

    const onSubmitCallback = (e) => {
        e.preventDefault();
        const usernameValue = ref.current.value;
        socket.auth = { username: usernameValue };
        socket.connect()
        setUsernameStatus(true);

    };


    useEffect(() => {


        socket.on("connect_error", (err) => {
            if (err.message = "Invalid Username")
                setUsernameStatus(false);
        })
        socket.on("session", ({ sessionID, userID }) => {
            socket.auth = { sessionID }
            // setUsername(session.username);
            console.log("session");
            localStorage.setItem("sessionID", sessionID);
            socket.userID = userID;
        })


        return () => {
            socket.off("connect_error");
            socket.off("session");

        }
    }, []);

    if (sessionID !== null && hasUsername === false) {

        console.log("Fetched session from browser", sessionID)
        socket.auth = { sessionID };
        socket.connect()
        setUsernameStatus(true);

    }
    if (!hasUsername) {
        return (
            <>
                <div className={styles.central}>
                    <div className={styles.form_structure} >
                        <form onSubmit={onSubmitCallback}>
                            <input className={styles.username_input} ref={ref} type="text" placeholder="Username" />
                            <button className={styles.username_button}> Set Username </button>
                        </form>
                    </div>
                </div>
            </>
        )


    }
    else {
        return (
            <div className={styles.main_container}>
                <div className={styles.friend_message_container}>
                    <Friendlist setState={setState} />
                    <MessageList state={state} />
                </div>
                <MessageInput selectedID={state.selectedID} />
            </div>

        )
    }



}

export default App;