import { Router } from "express";
import { uploadVideo } from "../controllers/videos.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { resetCookies } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/uploadVideo").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount:1
        },
        {
            name: "thumbnail",
            maxCount:1
        }
    ]),
    resetCookies,
    uploadVideo
 )

export default router