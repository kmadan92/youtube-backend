import { apiErrors } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {Subscription} from "../models/youtube/subscription.models.js";
import {User} from "../models/youtube/users.models.js";
import dotenv from 'dotenv';

dotenv.config({path:'./.env'})

const toggleSubscription = asyncHandler(async (req, res) => {

    const user = req.user?._id
    const {channel} = req.params
    let toggle = undefined

    // check if channel exists or not
    const checkForChannel = await User.findOne(
        {
            username:channel
        }
    )

    if(!checkForChannel){

        throw new apiErrors(400,"Channel not present")
    }

    //check if user has subscribed channel or not
    const checkForSubscription = await Subscription.findOne(
        {
            $and: [{subscriber: user},{channel: checkForChannel?._id}]
        }
    )

    if(checkForSubscription){
        
        const deleteSubscription = await Subscription.deleteOne({

            subscriber: user,
            channel: checkForChannel?._id

        })

        if(deleteSubscription.deletedCount ===0){

            throw new apiErrors(500,"Problem while deleting user from DB during untoggling operation")
        }

        toggle = false
    }
    else{
        
        const addSubscription = await Subscription.insertOne({ 

            subscriber: user,
            channel: checkForChannel?._id
        })

        
        if(!addSubscription){

            throw new apiErrors(500, "Not able to subscribe Channel")
        }

        
        toggle = true

    }

    return res.status(201).json(

        new apiResponse(201,{channel, toggle},"Toggle Subscription Successfull")
    )
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {

})

const getSubscribedChannels = asyncHandler(async (req, res) => {

})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }