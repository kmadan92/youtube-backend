import { Router } from "express";
import { toggleSubscription, getUserChannelSubscribersCount, getSubscribedChannelsCount,
    getUserChannelSubscribersList, getSubscribedChannelsList
} from "../controllers/subscribers.controllers.js";
import {resetCookies} from "../middleware/auth.middleware.js";

const router = Router()

// route for toggleSubscription
router.route("/toggleSubscription/:channel").post(resetCookies,toggleSubscription)

// route to get Channel subscribers count
router.route("/getUserChannelSubscribersCount/:channel").get(resetCookies,getUserChannelSubscribersCount)

//route to get subscribed channel by user count
router.route("/getSubscribedChannelsCount").get(resetCookies,getSubscribedChannelsCount)

// route to get Channel subscribers list
router.route("/getUserChannelSubscribersList/:channel").get(resetCookies,getUserChannelSubscribersList)

// route to get Subscribed Channel list
router.route("/getSubscribedChannelsList").get(resetCookies,getSubscribedChannelsList)

export default router
