import React, { useState, useContext, useEffect } from 'react';
import styles from './FriendList.module.css'
import SocketContext from "./socketContext.js";

function Friendlist(props) {

    const [users, setUsers] = useState([]);
    const socket = useContext(SocketContext);
    
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
            let toBeSent =[]

            setUsers((prevUsersState) => {
                const new_state = prevUsersState.map((user) => {
                    if (user.userID == forUserID){
                        user.messages.push(message)
                        toBeSent = user.messages;
                       
                    }
                    return user;
                });
                return [...new_state]
            });
            props.setState({selectedID: message.to, messages: toBeSent})
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


    return (

        <div className={styles.friend_container}>

            {users.map((user,index) => {

                return <p onClick={(e) => { props.setState(() => {
                    console.log("messages for selected friend!!", user.messages);
                    return {selectedID: user.userID, messages: user.messages || []}
                }) }} className={styles.friend} key={index} > { socket.userID == user.userID ? "Yourself" : user.username}  Status: {user.connected ? "Online" : "Offline"} </p>
            })}
        </div>
    )
}

export default Friendlist;
