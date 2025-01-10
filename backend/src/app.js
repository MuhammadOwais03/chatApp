import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { Server } from "socket.io";
import http from "http";

import { userRouter } from "./routes/user.route.js";
import { messagesRouter } from "./routes/messages.route.js";
import seedDatabase from "./seeds/seeds.users.js";

// Initialize Express app
const app = express();
const __dirname = path.resolve();
const server = http.createServer(app);

// CORS configuration - Adjust it for development and production environments
const allowedOrigins = ["https://chat-app-chatty.vercel.app", "http://localhost:5173", "wss://chat-app-chatty.vercel.app"];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow credentials (cookies or JWT)
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
    transports: ['websocket'],
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Store connected users by their socket ID
const newSocketUser = {};

export const getUserSocketId = (userId) => {
    return newSocketUser[userId];
};

// Handle WebSocket connections
io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) {
        newSocketUser[userId] = socket.id;  // Store socket by userId
    }

    // Emit the online users
    io.emit("getOnlineUsers", Object.keys(newSocketUser));

    socket.on("disconnect", (reason) => {
        console.log(`A user disconnected: ${socket.id}, Reason: ${reason}`);

        const user = Object.keys(newSocketUser).find(userId => newSocketUser[userId] === socket.id);

        if (user) {
            delete newSocketUser[user];  // Remove from online users
        }

        // Emit the updated online users
        io.emit("getOnlineUsers", Object.keys(newSocketUser));
    });
});

// Middleware for parsing cookies and JSON requests
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// Routes
app.use("/api/users", userRouter);
app.use("/api/messages", messagesRouter);

// Test route to seed the database
app.post("/", (req, res) => {
    seedDatabase();
    res.json("hello");
});

// Export the app, server, and socket instance
export { app, server, io };

// Start the server
server.listen(5000, () => {
    console.log("Server running on port 5000");
});
