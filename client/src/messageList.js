import React, { useState, useContext, useEffect } from 'react';

import styles from './messageList.module.css';
import SocketContext from "./socketContext.js";

function MessageList(props) {
    const socket = useContext(SocketContext)
    console.log("Connected ", socket.connected);

    return (
        <div className={styles.messsage_container}>
            {
                props.state.messages.map((message, index) => {
                    if (message.to === props.state.selectedID || message.from === props.state.selectedID) {
                        return <p key={index} className={socket.userID === message.from ? styles.message_from : styles.message_to}> {message.message} </p>
                    }
                    return null
                })
            }
        </div>

    )
}

export default MessageList;