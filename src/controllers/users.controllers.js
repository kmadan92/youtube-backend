import { apiErrors } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/youtube/users.models.js";
import {uploadResult} from "../utils/fileUpload.js";

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
    
    // Generate token
    const accessToken = await loggedUser.generateAccessToken();
    const refreshToken = await loggedUser.generateRefreshToken();

    //save refresh token in Db without validation
    loggedUser.refreshToken = refreshToken
    await loggedUser.save({ validateBeforeSave: false })
    
    // create cookie options so that they cannot be modified by client
    const options = {
        httpOnly: true,
        secure: true
    }

    // return repsonse to user
    const returnLoggedUser = await User.findById(loggedUser._id).select(
        "-password"
    )

    res
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

const logoutUser = asyncHandler(async(req,res) => {

    

})

export {registerUser, loginUser, logoutUser}