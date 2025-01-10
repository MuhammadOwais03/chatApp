import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();

const server = http.createServer(app);


console.log(process.env.CORS_ORIGIN, "KK")

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
    },
});

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    socket.on("disconnect", (reason) => {
        console.log(`A user disconnected: ${socket.id}, Reason: ${reason}`);
    });
});

export { io, server, app };
