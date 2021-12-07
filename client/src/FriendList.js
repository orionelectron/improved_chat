import React, { useState, useContext, useEffect } from 'react';
import styles from './FriendList.module.css'
import SocketContext from "./socketContext.js";

function Friendlist() {
    const socket = useContext(SocketContext);
    const [users, setUsers] = useState([]);
   
    useEffect(() => {
        // socket.emit("sync");
        socket.connect();
        socket.once("users", (users1) => {
            console.log("FriendList ", users1);
            const filtered = users1.filter((user) => {
                return socket.userID !== user.userID
            });

            setUsers([...users1, ...users]);
        });
        socket.once("new_user", (new_user) => {
            console.log("New user received ", new_user);
            setUsers((prevState) => {
                const filtered = prevState.filter((user) => {
                    return user.userID !== new_user.userID
                });

                return [...filtered, new_user]
            });
        });
        socket.once("client_disconnected", (userID) => {
            console.log("A client got disconneted!!", userID);

            
            console.log("Filtered after disconnect ", users);
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
            socket.off("client_disconnected");
            socket.disconnect();
        }
        
    }, []);
    return (

        <div className={styles.friend_container}>

            {users.map((user) => {

                return <p className={styles.friend} key={user.userID} > {user.username}  Status: {user.connected ? "Online" : "Offline"} </p>
            })}
        </div>
    )
}

export default Friendlist;
