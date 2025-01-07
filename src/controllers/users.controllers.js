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

export {registerUser}