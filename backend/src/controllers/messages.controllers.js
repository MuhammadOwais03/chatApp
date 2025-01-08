
import {userSchema} from '../models/user.models.js';
import { Messages } from '../models/messages.model.js';
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { generateToken, generateAccessTokenFromRefreshToken } from '../utils/token.utils.js';
import bcrypt from 'bcryptjs'; 
import { v2 as cloudinary } from 'cloudinary';
import { uploadOnCloudinary } from '../utils/cloundinary.js';


export const getAllUsers = asyncHandler( async (req, res)=>{


    try {
        const loggedInUser = req.user._id;
        const filteredUser = await userSchema.find({ _id: { $ne: loggedInUser } });
        const response = new ApiResponse(200, { allUsers: filteredUser }, "Successfully fetched");

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

    const response = new ApiResponse(200, { messages: messages }, "Successfully fetched");

    return res.status(200).json(response);



})


export const postMessages = asyncHandler(async (req, res) => {
    const loggedInUser = req.user._id;
    const { senderId, chatWithId, text } = req.body;

    if (!senderId || !chatWithId || !text) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "senderId, chatWithId, and text are required"
            )
        );
    }

    let imagesurl = [];
    if (req.files && req.files.length > 0) {
        imagesurl = req.files.map((image) => image.path);

        try {
            imagesurl = await Promise.all(
                imagesurl.map((path) => uploadOnCloudinary(path))
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

    try {
        const message = await Messages.create({
            senderId: senderId,
            receiverId: chatWithId,
            text: text,
            images: imagesurl
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

        return res.status(201).json(
            new ApiResponse(
                201,
                { message: messageChecked },
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