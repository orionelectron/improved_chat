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
const httpServer = createServer();
const chatServer = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",

    },



});



chatServer.use(async (socket, next) => {
    console.log("SessionStore", sessionStore);
    const session = socket.handshake.auth.session;
    console.log(session);
    try {
        if (session) {
            const uname = sessionStore.findSession(session.sessionID).username;
            console.log(uname);
            socket.sessionID = session.sessionID;
            socket.userID = session.userID;
            socket.username = uname;
            socket.connected = true;
            sessionStore.saveSession(socket.sessionID, { sessionID: socket.sessionID, userID: socket.userID, username: socket.username, connected: true });
            return next();
        }

        else if (!socket.handshake.auth.username) {
            return next(new Error("Invalid Username"));
        }
        else {
            socket.username = socket.handshake.auth.username;
            socket.sessionID = uuidv4();
            socket.userID = uuidv4();
            socket.connected = true;
            sessionStore.saveSession(socket.sessionID, { sessionID: socket.sessionID, userID: socket.userID, username: socket.username, connected: true });
            return next();
        }


        //console.log("SessionStore", sessionStore);
        
    }
    catch (ex) {
        console.log("Error: ", ex);
        return next(new Error("Got a unique error!!"));
    }

});

chatServer.on("connection", (socket) => {
    console.log("A client connected ", socket.id);
    socket.join(socket.userID);

    const users = [];

    const sessions = sessionStore.findAllSessions();
    sessions.forEach((session) => {
        users.push({
            userID: session.userID,
            username: session.username,
            connected: session.connected
        });
    })

    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
    });
    socket.emit("users", users);
    socket.broadcast.emit("new_user", {
        userID: socket.userID,
        username: socket.username,
        connected: true
    });

    socket.on("private_message", ({ content, to }) => {
        socket.broadcast.to(to).emit("private_message", {
            content,
            from: socket.userID
        })
    });
    socket.on("sync", () => {
        const users = [];

        for (let [id, socket] of chatServer.of('/').sockets) {
            users.push({
                userID: id,
                username: socket.username,
            });
        }
        socket.emit("users", users);
    })

    socket.on("disconnect", async () => {
        const clients = await chatServer.in(socket.userID).allSockets();
        const isDisconnected = clients.size === 0;
        if (isDisconnected)
            socket.broadcast.emit("client_disconnected", socket.userID);
        sessionStore.saveSession(socket.sessionID, {
            userID: socket.userID,
            sessionID: socket.sessionID,
            username: socket.username,
            connected: false
        });


    })
})

httpServer.listen(4000, () => {
    console.log("Server Listening on port ", 4000);
})