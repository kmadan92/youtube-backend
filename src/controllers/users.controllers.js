import { apiErrors } from "../utils/apiErrors.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/youtube/users.models.js";

const registerUser = asyncHandler(async(req,res) => {

    //get user details
   const {username, fullname, email, password} = req.body
   console.log(req.body)

   //validation for empty fields
   if(
    [username, fullname, email, password].some((field) => field?.trim() === "")
   )
   {
    throw new apiErrors(400,"Fields cannot be empty")
   }

   //validation for already esisting fields in Db
   const existedUser = User.findOne(
    {
        $or: [{username},{email}]
    }
   )
   
   if(existedUser){
    throw new apiErrors(409, "Username or Email already exists")
   }

   //validate image files
   const avatarlocalpath = req.files?.avatar[0]?.path
   const coverImagelocalpath = req.files?.coverImage[0]?.path

});

export {registerUser}