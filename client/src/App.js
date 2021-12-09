import React, { useState, useEffect } from "react";
import styles from './App.module.css';
import { useDispatch, useSelector } from "react-redux";
import socket from './socket.js';
//import Friendlist from "./FriendList.js";
//import SocketContext from "./socketContext.js";
//import SelectUsername from "./SelectUsername.js";
//import MessageInput from "./messageInput.js";
//import MessageList from "./messageList.js";
import {
    selectedIDSet,
    messageSet,
    usersSet,
    usersMessagesUpdate,
    receivedMessageUserUpdate,
    updateUsersAfterDisconnect,
    addNewUser
} from "./redux/store.js"

let prev_users = [];
function App() {
    const dispatch = useDispatch();
    const messages = useSelector((state) => {
        console.log("Initial messages ", state.state.messages)
        return state.state.messages;
    });
    const selectedID = useSelector((state) => {
        console.log("Initial selectedID ", state.state.selectedID)
        return state.state.selectedID;
    });
    const users = useSelector((state) => {
        console.log("Initial users ", state.state.users)
        return state.state.users
    });
    console.log("Initial users ", users)
    let sessionID = localStorage.getItem("sessionID");
    const [hasUsername, setUsernameStatus] = useState(false);

    const ref = React.createRef();
    const ref2 = React.createRef();

    const onSubmitCallback = (e) => {
        e.preventDefault();
        const usernameValue = ref.current.value;
        socket.auth = { username: usernameValue };
        socket.connect()
        setUsernameStatus(true);

    };
    const selectedFriend = ({to, currentUser}) => {
        dispatch(messageSet({to, currentUser}))
        dispatch(selectedIDSet(to));
        
        

    };
    const sendMessage = (e) => {
        e.preventDefault();

        const message = { message: ref2.current.value, to: selectedID, from: socket.userID };


        console.log("message submitted");
        socket.emit("private_message", message);
        dispatch(usersMessagesUpdate(message));




    }



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
    useEffect(() => {


        socket.on("users", (users1) => {
            dispatch(usersSet(users1));
        });


        socket.on("private_message", (message) => {
            console.log("private_message ", message);
            const forUserID = message.to;
            const prevUsersState = users;
            dispatch(receivedMessageUserUpdate({message, currentUser: socket.userID}));



        })

        socket.on("new_user", (new_user) => {
            console.log("New user received ", new_user);
           
           

            
            dispatch(addNewUser(new_user));
        });

        socket.on("client_disconnected", (userID) => {
            console.log("A client got disconneted!!", userID);
            dispatch(updateUsersAfterDisconnect({userID, connected: false}));



        })

        return () => {
            socket.off("users");
            socket.off("new_user");
            socket.off("client_disconnected")
            socket.off("private_message")
        }
    }, [])

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
                    <div className={styles.friend_container}>

                        {users.map((user, index) => {
                            console.log("user", user);
                            return <p onClick={() => selectedFriend({to: user.userID, currentUser: socket.userID})} className={styles.friend} key={index} > {socket.userID == user.userID ? "Yourself" : user.username}  Status: {user.connected ? "Online" : "Offline"} </p>
                        })}
                    </div>
                    <div className={styles.messsage_container}>
                        {
                            messages.map((message, index) => {
                                if (message.to === selectedID || message.from === selectedID) {
                                    return <p key={index} className={socket.userID === message.from ? styles.message_from : styles.message_to}> {message.message} </p>
                                }
                                return null
                            })
                        }
                    </div>
                </div>
                <form onSubmit={sendMessage}>
                    <input ref={ref2} type="text" placeholder="Message" />
                    <button> Send Message </button>
                </form>
            </div>

        )
    }



}

export default App;