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

const getUserChannelSubscribersCount = asyncHandler(async (req, res) => {

    const {channel} = req.params

    //check if channel exists
    const userChannel = await User.findOne({
        username: channel
    })
    
    if(!userChannel){
        throw new apiErrors(400, "Channel does not ecists")
    }

    const ChannelSubscriberAP = await Subscription.aggregate([
        {
            $match: {
                channel: userChannel?._id
            }
        },
        {
             $count: "TotalSubscriber"
        }
    ]);

    let ChannelSubscriber = undefined

    if(ChannelSubscriberAP.length ===0){
        ChannelSubscriber = {TotalSubscriber:0}
    }
    else{
        ChannelSubscriber = ChannelSubscriberAP.at(0)
    }

    return res.status(201).json(

        new apiResponse(201,{channel, ChannelSubscriber},"Get Channel Subscriber Count Successfull")
    )

})

const getSubscribedChannelsCount = asyncHandler(async (req, res) => {

    const user = req.user?._id
    const username = req.user?._username

    const subscribedChannels = await Subscription.aggregate([

        {
            $match:{
                subscriber:user
            }
        },
        {
            $count: "SubscribedChannels"
        }
    ])

    let Subscribed = undefined

    if(subscribedChannels.length ===0){
        Subscribed = {SubscribedChannels:0}
    }
    else{
        Subscribed = subscribedChannels.at(0)
    }

    return res.status(201).json(

        new apiResponse(201,{username, Subscribed},"Get Channel Subscribed By User Clount Successful")
    )
})

const getSubscribedChannelsList = asyncHandler(async (req, res) => {

    const user = req.user?._id
    const username = req.user?._username

    const subscribedChannels = await Subscription.aggregate([

        {
            $match:{
                subscriber:user
            }
        },
        {
            $lookup:
            {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscriber_lookup"
            }
        },
        {
            $project:{
                    Channels:{
                    $arrayElemAt:["$subscriber_lookup.username",0]
                  },
                    _id:0
            }
        }
    ])

    let Subscribed = undefined

    if(subscribedChannels.length ===0){
        Subscribed = {Channels:{}}
    }
    else{
        Subscribed = subscribedChannels.at(0)
    }

    return res.status(201).json(

        new apiResponse(201,{username, Subscribed},"Get Subscribed Channel List Success")
    )
})

const getUserChannelSubscribersList = asyncHandler(async (req, res) => {

    const {channel} = req.params

    //check if channel exists
    const userChannel = await User.findOne({
        username: channel
    })
    
    if(!userChannel){
        throw new apiErrors(400, "Channel does not ecists")
    }

    const ChannelSubscriberAP = await Subscription.aggregate([
        {
            $match: {
                channel: userChannel?._id
            }
        },
        {
             $lookup:
                {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscriberList"
                  }
        },
        {
            $project:{
                "Subscribers":{
                    $arrayElemAt:["$subscriberList.username",0]
                  },
                  "_id":0
            }
        }
    ]);

    let ChannelSubscriber = undefined 

    if(ChannelSubscriberAP.length ===0){
        ChannelSubscriber = {Subscribers:{}}
    }
    else{
        console.log(ChannelSubscriberAP.forEach((x)=>x.Subscribers))
        ChannelSubscriber = ChannelSubscriberAP
    }
    console.log(ChannelSubscriber)
    return res.status(201).json(

        new apiResponse(201,{channel, ChannelSubscriber},"Get Channel Subscriber List Successfull")
    )

})

export { toggleSubscription, getUserChannelSubscribersCount, getSubscribedChannelsCount, getUserChannelSubscribersList, getSubscribedChannelsList }