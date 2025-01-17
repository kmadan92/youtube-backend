import { apiErrors } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/youtube/users.models.js";
import {uploadResult} from "../utils/fileUpload.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

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
    const returnLoggedUser = await User.findById(loggedUser._id).select(
        "-password"
    )

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(200, 
            {returnLoggedUser,accessToken},
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

export {registerUser, loginUser, logoutUser, refreshAccessToken}