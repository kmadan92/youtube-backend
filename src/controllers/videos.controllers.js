import { apiErrors } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {Video} from "../models/youtube/video.models.js";
import dotenv from 'dotenv';

dotenv.config({path:'./.env'})

const uploadVideo = asyncHandler(async (req, res) => {

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