import { Router } from "express";
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels} from "../controllers/subscribers.controllers.js";
import {resetCookies} from "../middleware/auth.middleware.js";

const router = Router()

// route for toggleSubscription
router.route("/toggleSubscription/:channel").post(resetCookies,toggleSubscription)

// route to get Channel subscribers
router.route("/getUserChannelSubscribers/:channel").get(resetCookies,getUserChannelSubscribers)

//route to get subscribed channel by user
router.route("/getSubscribedChannels").get(resetCookies,getSubscribedChannels)

export default router
