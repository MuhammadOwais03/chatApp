// import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { app } from "./utils/socket.js";
import { userRouter } from "./routes/user.route.js";
import { messagesRouter } from "./routes/messages.route.js";

import path from "path";


import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const __dirname = path.resolve();

const server = http.createServer(app);


console.log(process.env.CORS_ORIGIN, "KK")

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});


const newSocketUser = {}


export const getUserSocketId = (userId) => {
    return newSocketUser[userId]
}

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) {
        newSocketUser[userId] = socket.id;  // Store socket by userId
    } else {
        console.log('No userId provided in connection query');
    }

    console.log(newSocketUser);

    // Emit the online users
    io.emit("getOnlineUsers", Object.keys(newSocketUser));

    socket.on("disconnect", (reason) => {
        console.log(`A user disconnected: ${socket.id}, Reason: ${reason}`);

        
        const user = Object.keys(newSocketUser).find(userId => newSocketUser[userId] === socket.id);

        console.log("Delete:", user)

        if (user) {
            delete newSocketUser[user];  
            console.log(`Removed userId: ${user} from online users`);
        }

        console.log(newSocketUser)

        // Emit the updated online users
        io.emit("getOnlineUsers", Object.keys(newSocketUser));
    });
});






console.log(process.env.CORS_ORIGIN)

app.use(cookieParser());
app.use(cors({
    origin: "https://chat-app-chatty.vercel.app",
    credentials: true,
}));

console.log(process.env.CORS_ORIGIN);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));


import seedDatabase from "./seeds/seeds.users.js";

// Routes
app.use("/api/users", userRouter);
app.use("/api/messages", messagesRouter);

app.post("/", (req, res) => {
    seedDatabase()
    res.json("hello");
});


if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }

export { app, server, io };
