
import { Router } from "express";

import { deleteMessage, getAllUsers, messageWithUser, postMessages, updateMessage } from "../controllers/messages.controllers.js";

import verifyToken from "../middleware/verifyToken.middleware.js";
import { upload } from "../middleware/multer.js";



const messagesRouter = Router()

//allusers
//messageswithuser
//postmessage


messagesRouter.get('/users', verifyToken, getAllUsers)
messagesRouter.get('/message/:id', verifyToken, messageWithUser)
messagesRouter.post('/post-message', verifyToken, upload.array('images') , postMessages)
messagesRouter.delete('/delete-message/:id', verifyToken, deleteMessage)
messagesRouter.put('/delete-message/:id', verifyToken, updateMessage)


export {messagesRouter}