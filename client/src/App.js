import React, { useState, useEffect } from "react";
import styles from './App.module.css';
import socket from './socket.js';
//import Friendlist from "./FriendList.js";
//import SocketContext from "./socketContext.js";
//import SelectUsername from "./SelectUsername.js";
//import MessageInput from "./messageInput.js";
//import MessageList from "./messageList.js";

let prev_users = [];
function App() {
    let sessionID = localStorage.getItem("sessionID");
    const [hasUsername, setUsernameStatus] = useState(false);
    const [users, setUsers] = useState(prev_users);
    const [state, setState] = useState({selectedID: '', messages: []})
    const ref = React.createRef();
    const ref2 = React.createRef();

    const onSubmitCallback = (e) => {
        e.preventDefault();
        const usernameValue = ref.current.value;
        socket.auth = { username: usernameValue };
        socket.connect()
        setUsernameStatus(true);

    };
    const selectedFriend = (userID, messages) => {
        setState((prevState) => {
            return {selectedID: userID, messages: messages}
        });
    };
    const sendMessage = (e) => {
        e.preventDefault();
        const selectedID = state.selectedID;
        const message = {message: ref2.current.value, to: selectedID, from: socket.userID}
        
        const mappedFriendlist = users.map((user) => {
            if (user.userID === selectedID || user.userID === socket.userID){
                user.messages.push(message);
            }
        })
    

        
        
        console.log(selectedID);
        console.log("message submitted");
        socket.emit("private_message", message);
        setUsers(() => {
            return [...mappedFriendlist]
        })
        

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
            console.log("FriendList ", users1);
            setUsers((prevState) => {
                return [...prevState, ...users1]
            });
        });

       
        socket.on("private_message", (message) => {
            console.log("private_message ", message);
            const forUserID = message.to;

            setUsers((prevUsersState) => {
                const new_state = prevUsersState.map((user) => {
                    if (user.userID === forUserID){
                        user.messages.push(message)
                        
                       
                    }
                    return user;
                });
                return [...new_state]
            });
            
        })

        socket.on("new_user", (new_user) => {
            console.log("New user received ", new_user);
            let new_user1 = new_user;
            if (new_user1.messages === undefined)
                new_user1.messages = []
            setUsers((prevState) => {
                const filtered = prevState.filter((user) => {
                    return user.userID !== new_user.userID
                });

                return [...filtered, new_user1]
            });
        });
        socket.on("client_disconnected", (userID) => {
            console.log("A client got disconneted!!", userID);



            setUsers((prevState) => {
                const updated = prevState.map((user) => {
                    if (user.userID === userID) {
                        user.connected = false;
                    }
                    return user;
                });
                return updated;
            });

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
                                    console.log("user",user);
                            return <p onClick={() => selectedFriend(user.userID, user.messages)} className={styles.friend} key={index} > {socket.userID == user.userID ? "Yourself" : user.username}  Status: {user.connected ? "Online" : "Offline"} </p>
                        })}
                    </div>
                    <div className={styles.messsage_container}>
                        {
                            state.messages.map((message, index) => {
                                if (message.to ===state.selectedID || message.from === state.selectedID) {
                                    return <p key={index} className={socket.userID === message.from ? styles.message_from : styles.message_to}> {message.message} </p>
                                }
                                return null
                            })
                        }
                    </div>
                </div>
                <form onSubmit={sendMessage}>
                    <input ref={ref2} type="text" placeholder="Message"  />
                    <button> Send Message </button>
                </form>
            </div>

        )
    }



}

export default App;