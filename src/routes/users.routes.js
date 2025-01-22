import { Router } from "express";
import {registerUser, loginUser, logoutUser, refreshAccessToken, 
    changePassword, updateUserDetails, updateAvatar,getUser} from "../controllers/users.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import {resetCookies} from "../middleware/auth.middleware.js";

const router = Router()

// route for registering user
router.route("/register").post(
    upload.fields([
        {
            name:  "avatar",
            maxCount:1 
        },
        {
            name:  "coverImage",
            maxCount:1
        }
    ]
    ),
    registerUser
)

// route for logging in user
router.route("/login").post(loginUser)

// route for logging out user
router.route("/logout").post(resetCookies,logoutUser)

// route for refreshing access token
router.route("/refreshAccessToken").post(refreshAccessToken)

// route for updating password
router.route("/changePassword").patch(resetCookies,changePassword)

// route for updating user details
router.route("/updateUserDetails").patch(resetCookies,updateUserDetails)

// route for updating avatar
router.route("/updateAvatar").patch(
upload.single("avatar"),
resetCookies,
updateAvatar)

//route for get user
router.route("/getUser").get(resetCookies,getUser)

export default router