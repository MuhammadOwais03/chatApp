import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


const { Schema } = mongoose;

const UserSchema = new Schema ({

    email: {
        type:'String',
        required: true,
        unique: true,
    },

    fullName: {
        type:'String',
        required: true,
    },
    password: {
        type: 'String',
        required: 'true',
    },

    profilePic: {
        type: 'String',
        default: ""
    }
}, {timestamps: true})


UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});



UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

const userSchema = mongoose.model('User', UserSchema);
export {userSchema};

