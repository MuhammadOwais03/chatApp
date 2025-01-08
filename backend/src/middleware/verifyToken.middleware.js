import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { userSchema } from '../models/user.models.js';

const verifyToken = asyncHandler(async (req, res, next) => {
    // Access the token from cookies
    const token = req.cookies.accessToken;  // Use req.cookies to access cookies

    if (!token) return res.status(403).json(new ApiResponse(403, null, 'Access denied'));

    try {
        // Verify token
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 

        if (!payload) {
            return res.status(401).json(
                new ApiResponse(401, null, 'Invalid Token')
            );
        }

        // Find user and attach to req object
        const user = await userSchema.findById(payload.userId).select('-password');

        if (!user) {
            return res.status(401).json(
                new ApiResponse(401, null, 'User not found')
            );
        }

        req.user = user;  // Attach user to the request object
        next();  // Pass control to the next middleware
    } catch (err) {
        console.log(err);
        return res.status(404).json(
            new ApiResponse(404, null, 'Error in Validating token')
        );
    }
});

export default verifyToken;
