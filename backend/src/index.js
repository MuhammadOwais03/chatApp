import dotenv from "dotenv";
import connection from "./db/dbConnection.js";
// import { app, server } from "./utils/socket.js";
import { app, server } from "./app.js";

// Load environment variables
dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

connection()
    .then(() => {
        server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}/`);
        });
    })
    .catch((err) => console.log("MongoDB connection failed", err));
