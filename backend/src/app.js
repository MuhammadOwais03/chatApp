import express from "express"
import cors from "cors"
import cookieParser from 'cookie-parser';



const app = express()

app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))


//Routes

import { userRouter } from "./routes/user.route.js"
import { messagesRouter } from "./routes/messages.route.js";

app.post('/', (req, res)=>{
    res.json('hello')
})

app.use('/api/users', userRouter)
app.use('/api/messages', messagesRouter)

export { app }