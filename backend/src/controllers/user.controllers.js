import {userSchema} from '../models/user.models.js';
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { generateToken, generateAccessTokenFromRefreshToken } from '../utils/token.utils.js';
import bcrypt from 'bcryptjs'; // for password hashing
import { uploadOnCloudinary } from '../utils/cloundinary.js';

export const userRegistration = asyncHandler(async (req, res) => {

    console.log(req.body)
    
    const { email, fullName, password } = req.body;

    if ([email,fullName, password].some((field) => field?.trim() === "")) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Field should be filled"
            )
        )
    }


    const userExist = await userSchema.findOne({email})

    if (userExist) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "User exist with this email"
            )
        )
    }

    const newUser = await userSchema.create(
        {
            email,
            fullName,
            password
        }
    )

    try {
        await newUser.save()
    }
    catch (error) {
        console.log(error)
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Error in creating User"
            )
        )
    }

    const {accessToken, refreshToken} = await generateToken(newUser._id, newUser.email)

    const savedUser = await userSchema.findOne({email}).select(
        "-password"
      );

    if (!savedUser) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Error in creating User I"
            )
        )
    }

    const options = {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== 'developement',
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options) 
        .json(
            new ApiResponse(
                200,
                { user: savedUser },
                "User Registered Successfully"
            )
        );

});


export const login = asyncHandler(async(req, res)=>{
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const userExist = await userSchema.findOne({email})

    if (!userExist) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "User exist with this email"
            )
        )
    }

    const passCheck = await userExist.comparePassword(password)

    if (!passCheck) {
        return res.status(400).json(
            new ApiResponse(
                401,
                null,
                "Invalid User Cradentials"
            )
        )
    }

    const {accessToken, refreshToken} = await generateToken(userExist._id,userExist.email)

    console.log(accessToken)

    const options = {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== 'developement',
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                 userExist,
                "User Logged In Successfully"
            )
        );

})



export const logout = asyncHandler( async (req, res)=>{
    res.cookie('accessToken', {maxAge:0})

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "User Logged out Successfully"
            )
        );

})

export const updateProfile = asyncHandler(async (req, res) => {

    console.log(req.file);

    const { email, password } = req.body;
    const { file } = req; 
    const profilePic = file;

    const userId = req.user._id; 

    // Check if the user exists before proceeding
    const user = await userSchema.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Prepare the update object
    let updateData = {};

    // Check if email exists and is valid before updating
    if (email && email !== "null") {  // Ensure email is not "null" or undefined
        console.log("EMAIL", email, typeof(email));
        const emailExists = await userSchema.findOne({ email });

        if (emailExists) {
            return res.status(400).json(
                new ApiResponse(400, null, "Email already exists")
            );
        }

        updateData.email = email;  // Add email to update object
    }

    // Check if password is being changed
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;  // Add password to update object
    }

    // If there is a profile picture, handle upload
    if (profilePic) {
        try {
            const result = await uploadOnCloudinary(profilePic.path);
            updateData.profilePic = result.secure_url;  // Add profilePic to update object
        } catch (error) {
            console.log(error);
            return res.status(500).json(
                new ApiResponse(500, null, "Error uploading profile picture to Cloudinary")
            );
        }
    }

    // Use findByIdAndUpdate to update user document
    try {
        const updatedUser = await userSchema.findByIdAndUpdate(
            userId, 
            updateData,  // Pass the updateData object
            { new: true } // To return the updated document
        );

        return res.status(200).json(
            new ApiResponse(200, updatedUser , "Profile updated successfully")
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            new ApiResponse(500, null, "Error updating profile")
        );
    }
});



export const check = asyncHandler( async (req, res)=>{

    const id = req.user._id

    const user = await userSchema.findOne(id).select("-password")


    res.status(201).json(
        new ApiResponse(
            201,
            user,
            "user is authenticated"
        )
    )
})