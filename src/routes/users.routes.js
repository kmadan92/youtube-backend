import { Router } from "express"
import {registerUser, loginUser} from "../controllers/users.controllers.js"
import { upload } from "../middleware/multer.middleware.js"

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

export default router