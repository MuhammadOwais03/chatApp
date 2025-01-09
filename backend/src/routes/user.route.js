import { Router } from "express";


import { userRegistration, login, logout, updateProfile, check } from "../controllers/user.controllers.js";
import verifyToken from "../middleware/verifyToken.middleware.js";
import { upload } from "../middleware/multer.js";

const userRouter = Router()

userRouter.post('/register', userRegistration)
userRouter.post('/login', login)
userRouter.post('/logout', logout)

userRouter.post('/update-profile', verifyToken, upload.single('profilePic'), updateProfile)
userRouter.get('/check', verifyToken, check)

export {userRouter}