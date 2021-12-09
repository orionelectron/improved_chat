import { Server } from "socket.io";
import { createServer } from 'http';
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import InMemorySessionStore from "../client/src/sessionStore.js";
import InMemoryMessageStore from "../client/src/messageStore.js";

const redisClient = new Redis();
const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();
const redisAdapter = createAdapter(pubClient, subClient);


const sessionStore = new InMemorySessionStore();
const messageStore = new InMemoryMessageStore();
const httpServer = createServer();
const chatServer = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",

    },



});



chatServer.use(async (socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
        const session = sessionStore.findSession(sessionID);
        if (session) {
            socket.sessionID = sessionID;
            socket.userID = session.userID;
            socket.username = session.username;
            return next();
        }
    }
    const username = socket.handshake.auth.username;
    if (!username)
        return next(new Error("Invalid Username"));

    socket.sessionID = uuidv4();
    socket.userID = uuidv4();
    socket.username = username;
    next()




});

chatServer.on("connection", (socket) => {
    console.log("A client connected ", socket.userID);
    sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: true,
    })
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
    });
    socket.join(socket.userID);

    const users = [];

    const sessions = sessionStore.findAllSessions();
    let messages = messageStore.findMessagesForUserID(socket.userID);
    console.log("MessagesForUserID ",messages )
    const messagesPerUser = new Map();
    messages.forEach((message) => {
        const { from, to } = message;
        const otherUser = socket.userID === from ? to : from;
        if (messagesPerUser.has(otherUser)) {
            messagesPerUser.get(otherUser).push(message);
        } else {
            messagesPerUser.set(otherUser, [message]);
        }
    });

    sessions.forEach((session) => {
        let messages = messagesPerUser.get(session.userID);
        
        users.push({
            userID: session.userID,
            username: session.username,
            connected: session.connected,
            messages:  messages !== undefined? messages: []

        });
    })

    socket.emit("users", users);

    socket.broadcast.emit("new_user", {
        userID: socket.userID,
        username: socket.username,
        connected: true,
        messages: []
    });

    socket.on("private_message", ({ message, to }) => {
        console.log(message, to);
        const new_message = { message, to, from: socket.userID };
       // socket.to(to).to(socket.userID).emit("private_message", new_message)
        chatServer.to(to).emit("private_message", new_message);
        messageStore.saveMessage(new_message);
        console.log(messageStore);

    });


    socket.on("disconnect", async () => {
        const clients = await chatServer.in(socket.userID).allSockets();
        console.log("Clients size ", clients.size)
        const isDisconnected = clients.size === 0;

        if (isDisconnected){
            socket.broadcast.emit("client_disconnected", socket.userID);
            sessionStore.saveSession(socket.sessionID, {
                userID: socket.userID,
                sessionID: socket.sessionID,
                username: socket.username,
                connected: false
            });
        }
       


    })
})

httpServer.listen(4000, () => {
    console.log("Server Listening on port ", 4000);
})