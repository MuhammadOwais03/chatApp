
import {userSchema} from '../models/user.models.js';
import { Messages } from '../models/messages.model.js';
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { generateToken, generateAccessTokenFromRefreshToken } from '../utils/token.utils.js';
import bcrypt from 'bcryptjs'; 
import { v2 as cloudinary } from 'cloudinary';
import { uploadOnCloudinary } from '../utils/cloundinary.js';
import { getUserSocketId, io } from '../app.js';
import { isObjectIdOrHexString } from 'mongoose';


export const getAllUsers = asyncHandler( async (req, res)=>{


    try {
        const loggedInUser = req.user._id;
        const filteredUser = await userSchema.find({ _id: { $ne: loggedInUser } });
        const response = new ApiResponse(200, filteredUser , "Successfully fetched");

        return res.status(200).json(response);

    } catch (error) {
        console.error(error);
        const response = new ApiResponse(400, null, "Failed to fetch users");

        return res.status(400).json(response);
    }
    
    

})



export const messageWithUser = asyncHandler( async (req, res)=> {

    

    const {id: chatWithId} = req.params
    const loggedInUser = req.user._id

    const messages = await Messages.find(
        {
            $or: [
                {
                    senderId: loggedInUser, receiverId: chatWithId
                },

                {
                    senderId: chatWithId, receiverId: loggedInUser
                },
            ]
                    }
    )

    const response = new ApiResponse(200, messages , "Successfully fetched");

    return res.status(200).json(response);



})


export const postMessages = asyncHandler(async (req, res) => {
    const loggedInUser = req.user._id;
    const { senderId, chatWithId, text } = req.body;


    console.log(req.body, req.files)

    if (!senderId || !chatWithId ) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "senderId, chatWithId, and text are required"
            )
        );
    }

    console.log(req.files)

    let imagesurl = [];
    if (req.files && req.files.length > 0) {
        imagesurl = req.files.map((image) => image.path);

        try {
            imagesurl = await Promise.all(
                imagesurl.map(async (filePath) => {
                    const result = await uploadOnCloudinary(filePath);
                    return result.secure_url;
                })
            );
        } catch (error) {
            console.error("Error uploading images to Cloudinary:", error);
            return res.status(500).json(
                new ApiResponse(
                    500,
                    null,
                    "Error uploading images"
                )
            );
        }
    }

    console.log(imagesurl)

    try {
        const message = await Messages.create({
            senderId: senderId,
            receiverId: chatWithId,
            text: text,
            image: imagesurl
        });

        const messageChecked = await Messages.findById(message._id);

        if (!messageChecked) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    "Failed to send message"
                )
            );
        }


        const chatUserSocketId = getUserSocketId(chatWithId)

        console.log("chat", chatUserSocketId)

        if(chatUserSocketId) {
            console.log("new")
            io.to(chatUserSocketId).emit("newMessage",messageChecked)
        }

        return res.status(201).json(
            new ApiResponse(
                201,
                messageChecked,
                "Successfully sent the message"
            )
        );
    } catch (error) {
        console.error("Error creating message:", error);
        return res.status(500).json(
            new ApiResponse(
                500,
                null,
                "Internal server error"
            )
        );
    }
});


export const deleteMessage = asyncHandler (async (req, res)=>{
    const { msgId } = req.params;
    
    await Messages.findByIdAndDelete(msgId)

    return res.status(201).json(
        new ApiResponse(
            201,
            null,
            "Successfully delete the message"
        )
    );
    
})

export const updateMessage = asyncHandler (async (req, res)=>{

    const {text} = req.body
    const {msgId} = req.params

    try {
        await Messages.findByIdAndUpdate(msgId, { text: text })
    }

    catch (error) {
        console.log(error)
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Error updating msg"
            )
        );

    }

    //socket

    return res.status(201).json(
        new ApiResponse(
            201,
            {text: text, msgId: msgId},
            "Successfully updated the message"

        )
    )



})