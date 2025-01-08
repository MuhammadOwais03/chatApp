
import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userSchema",
        required: true    
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userSchema",
        required: true    
    },

    text: {
        type: String
    },

    image: {
        type: [String]
    }


}, {timestamps: true})

const Messages = mongoose.model("Messages", messageSchema)

export {Messages}