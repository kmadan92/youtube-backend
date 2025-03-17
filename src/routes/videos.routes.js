import { Router } from "express";
import { uploadVideo } from "../controllers/videos.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { resetCookies } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/uploadVideo").post(resetCookies,
    upload.single("video"),
    uploadVideo
 )

export default router