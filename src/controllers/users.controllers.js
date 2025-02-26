import { apiErrors } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/youtube/users.models.js";
import {Subscription} from "../models/youtube/subscription.models.js"
import {uploadResult} from "../utils/fileUpload.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import mongoose, {Schema} from "mongoose";

dotenv.config({path:'./.env'})

/*
Generate Access and Refresh Token
and save refresh token to Db
*/
const generateAccessAndRefreshToken = async function(user)
{
    try{

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    //save refresh token in Db without validation
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken, refreshToken}

    }catch(error)
    {
        throw new apiErrors(500,"Cannot Generate Access Or Refresh Token")
    }
}

/*
Validate user details
save details in Db
*/
const registerUser = asyncHandler(async(req,res) => {

    //get user details
   const {username, fullName, email, password} = req.body

   //validation for empty fields
   if(
    [username, fullName, email, password].some((field) => field?.trim() === "")
   )
   {
    throw new apiErrors(400,"Fields cannot be empty")
   }
 
   //validation for already esisting fields in Db
   const existedUser = await User.findOne(
    {
        $or: [{username},{email}]
    }
   )
   
   if(existedUser){
    throw new apiErrors(409, "Username or Email already exists")
   }

   
   //validate image files
   let avatarlocalpath;
   let coverImagelocalpath;
   if(req.files)
   {
    if(Array.isArray(req.files.avatar) && req.files.avatar.length > 0)
    {
        avatarlocalpath = req.files?.avatar[0]?.path
    }
    
    if(Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
        {
         coverImagelocalpath = req.files?.coverImage[0]?.path
        }
    
   }
   else{
    throw new apiErrors(400, "Avatar image is compulsory")
   }
   
   
   if(!avatarlocalpath){
    throw new apiErrors(400, "Avatar not found in local path!")
   }

   //upload on cloudinary and validate
   const avatar = await uploadResult(avatarlocalpath);
   const imageCover = await uploadResult(coverImagelocalpath);

   if(!avatar){
    throw new apiErrors(400, "Avatar not found on cloud!")
   }
   
   // entry to Db
   const user = await User.create({

    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: imageCover?.url || "",
    username: username.toLowerCase()
   })

   // validate entry and remove fields like password, refresh token to send in response
   const userEntry = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!userEntry){
    throw new apiErrors(500, "Something went wrong while registering user!")
   }

   // send success response
   return res.status(201).json(
    new apiResponse(201, userEntry, "User registered successfully")
   )
});

/*
Vaidate username password
generate tokens
set cookies and save refresh token in Db
and save refresh token to Db
*/
const loginUser = asyncHandler(async(req,res) => {

    const {username, password} = req.body

    // validate username should not be blank in request
    if(!username || !password)
    {
        throw new apiErrors(400,"Username and Password required")
    }

    //validate username exists in Db
    const loggedUser = await User.findOne({username});

    if(!loggedUser)
    {
        new apiErrors(400, "User not registered!")
    }
    
    //validate password
    const authenticatePassword = await loggedUser.isPasswordCorrect(password);
    
    if(!authenticatePassword)
    {
        throw new apiErrors(401,"Authentication Failed")
    }
    
    // Generate token and save refresh token to Db
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(loggedUser);
    
    // create cookie options so that they cannot be modified by client
    const options = {
        httpOnly: true,
        secure: true
    }

    // return repsonse to user
    const user = await User.findById(loggedUser._id).select(
        "-password"
    )

    if(!user){
        throw new apiErrors(500, "Something went wrong while login!")
       }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(200, 
            {user,accessToken},
        "User Log In Success"
        )
    )

});

/*
Accept data from cookies/header
decode token and set refresh token to null
clear client cookies
and save refresh token to Db
*/
const logoutUser = asyncHandler(async(req,res) => {

    const loggedOutUser = await User.findByIdAndUpdate(
        req.user._id,
        {refreshToken:null}, //setting refresh token to null
        {new:true}) //return updated document

    if(!loggedOutUser)
    {
        throw new apiErrors("500", "Token not deleted during logout process")
    }

    // set cookie option to be modified by only server
    const options = {
        httpOnly: true,
        secure: true
    }

    // send response and clear cookies
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{}, "User Logout Success!"))

})

const refreshAccessToken = asyncHandler(async(req,res) => {

    const incomingRefreshToken = req.cookie?.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken)
    {
        throw new  apiErrors(500, "Refresh Token not recieved from client")
    }

        const decodedRefreshToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        if(!incomingRefreshToken)
            {
                throw new apiErrors(500, "Refresh Token cannot be decoded")
            }
    
        const tokenUser = await User.findById(decodedRefreshToken._id)
    
        if(!tokenUser)
            {
                throw new apiErrors(500, "Cannot get user details from decoded refresh token")
            }
            

        if(incomingRefreshToken !== tokenUser?.refreshToken)
            {
                throw new apiErrors(500, "Incoming and Existing Token Mismatch")
            }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(tokenUser)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200,
                {accessToken, refreshToken},
             "AccessTokenRefreshed"
        )
        )

})

const changePassword = asyncHandler(async(req,res) => {

    const {currentPassword, newPassword, confirmPassword} = req.body

    if(!currentPassword || !newPassword || !confirmPassword)
    {
        throw new apiErrors(400, "Current, New and Confirmation Password Required")
    }

    if(newPassword !== confirmPassword)
        {
            throw new apiErrors(400, "New and Confirm Password do not match")
        }

    const user = await User.findById(req.user?._id)

    if(!user)
        {
            throw new apiErrors(500, "User not found while changing password")
        }

    const validatePasswordCorrect = await user.isPasswordCorrect(currentPassword)

    if(!validatePasswordCorrect)
    {
        throw new apiErrors(400, "Entered current password is wrong")
    }

    user.password = newPassword
    await user.save()

    const username = user.username

    return res.status(201).json(

        new apiResponse(201,{username},"Password Updated Successfully")
    )
})

const updateUserDetails = asyncHandler(async(req,res) => {

    let {fullName, email} = req.body

    if(!fullName && !email)
        {
            throw new apiErrors(400, "Atleast Full name or email required")
        }

    let user = await User.findById(req.user?._id)
    
    if(!user)
        {
            throw new apiErrors(500, "User not found while updating user details")
        }

    if(fullName && email)
    {
        user.email = email
        user.fullName = fullName
    }
    else if(!fullName)
    {
        user.email = email
        fullName = user.fullName
    }
    else if(!email)
    {
        user.fullName = fullName
        email = user.email
    }
    await user.save()

    return res.status(201).json(

        new apiResponse(201,{fullName, email},"Details Updated Successfully")
    )

    
})

const updateAvatar = asyncHandler(async(req,res) => {

    const file = req.file

    if(!file)
    {
        throw new apiErrors(400, "Avatar Image not found to update")
    }

    if(!req.file.path)
    {
        throw new apiErrors(500, "Path not found in avatar image to update")
    }

    const avatarLocalPath = req.file.path

    const uploadAvatarOnCloudinary = await uploadResult(avatarLocalPath)

    if(!uploadAvatarOnCloudinary.url)
    {
        throw new apiErrors(500, "Avatar not uploaded to cloudinary during updating avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: uploadAvatarOnCloudinary.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    if(!user)
    {
        throw new apiErrors(500, "Error updating Avatar")
    }

    return res.status(201).json(

        new apiResponse(201,{user},"Avatar Updated Successfully")
    )

})

const getUser = asyncHandler(async(req,res) => {

    const user = req.user

    if(!user)   
    {
        throw new apiErrors(500, "User Not Found")
    }

    return res.status(200).json(

        new apiResponse(200,{user},"User Fetched Successfully")
    )

})

const getUserChannelProfile = asyncHandler(async(req,res) => {

    const {username} = req.params

    if(!username)
    {
        throw new apiErrors(400, "User Not Found")
    }

    const details = await User.aggregate(

        [
            {
                $match: {
                    username: username
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscribers",
                    as: "subscribedTo"
                }
            },
            {
                $addFields:{
                    subscriberCount: {
                        $size: "$subscribers"
                    },
                    subscribedToCount: {
                         $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
                
            },
            {
                $project: {
                    username:1,
                    fullName:1,
                    subscriberCount:1,
                    subscribedToCount:1,
                    avatar:1,
                    coverImage:1
                }
            }
        ]
    )

    if(!details?.length)
    {
        throw new apiErrors(500, "Something went wrong while fetching channel details.")
    }

    return res.status(200).json(

        new apiResponse(200,details[0],"Channel Fetched Successfully")
    )

})

const getUserWatchHistory = asyncHandler(async(req,res) => {

    const history = await User.aggregate([

        {
            $match: {
                _id: req.user._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "videoDetails",
                pipeline :[
                    {
                        $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "videoOwnerDetails",
                        pipeline: [
                            {
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            history[0].videoDetails,
            "Watch history fetched successfully"))

})

export {registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, updateUserDetails, updateAvatar,getUser, getUserChannelProfile, getUserWatchHistory}