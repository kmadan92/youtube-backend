import { Router } from "express";
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels} from "../controllers/subscribers.controllers.js";
import {resetCookies} from "../middleware/auth.middleware.js";

const router = Router()

// route for toggleSubscription

router.route("/toggleSubscription/:channel").post(resetCookies,toggleSubscription)

export default router
