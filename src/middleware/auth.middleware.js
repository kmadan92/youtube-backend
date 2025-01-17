import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import {apiErrors} from "../utils/apiErrors.js"
import {User} from "../models/youtube/users.models.js"

/* Get Access Token From cookies,
Get user and pass it to request*/
const resetCookies = asyncHandler(async(req,res,next) => {

        // get and validate token from request cookies or header
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "")
    
        if (!token) {
            new apiErrors("500", "Cannot get token during logout")
        }
        
        // decode token using secret key
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        if (!decodedToken) {
            new apiErrors("500", "Cannot decode token during logout")
        }
        
        // set new property in request to pass request to controller
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        req.user = user
        
        // call next so that next function be called in routes
        next()

})

export {resetCookies}