import { apiErrors } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {Video} from "../models/youtube/video.models.js";
import dotenv from 'dotenv';
import { uploadResult } from "../utils/fileUpload.js";
import { User } from "../models/youtube/users.models.js";

dotenv.config({path:'./.env'})

const uploadVideo = asyncHandler(async (req, res) => {
   
    const {title, description, duration} = req.body
    const user = req.user._id

    const findUser = await User.findById(user)

    if(!findUser){
        throw new apiErrors(400, "User not logged in")
    }

    if(req.files && req.files.videoFile && req.files.thumbnail)
    {
        const videoPath = req.files.videoFile[0].path

        const thumbnailPath = req.files.thumbnail[0].path

        const videoUploader = await uploadResult(videoPath)
        const thumbnailUploader = await uploadResult(thumbnailPath)

        if(!videoUploader){
            throw new apiErrors(500, "Failed to upload video on cloud")
        }

        if(!thumbnailPath){
            throw new apiErrors(500, "Failed to upload thumbnail on cloud")
        }

        const newVideo = new Video({
            title: title,
            description: description,
            duration: duration,
            videoFile: videoUploader.url,
            thumbnail: thumbnailUploader.url,
            owner: user
        })

        const savedVideo = await newVideo.save()

        return res.status(201).json(
            new apiResponse(201, savedVideo.url, "Video Uploaded successfully"))

    }
    else{
        throw new apiErrors(400, "Video or Thumbnail not found")
    }

})

const deleteVideo = asyncHandler(async (req, res) => {

})

const getAllVideosByUser = asyncHandler(async (req, res) => {

})

const getVideosById = asyncHandler(async (req, res) => {

})

const watchVideo = asyncHandler(async (req, res) => {

})

const togglePublishStatus = asyncHandler(async (req, res) => {

})

export {uploadVideo, deleteVideo, getAllVideosByUser, getVideosById, watchVideo, togglePublishStatus}