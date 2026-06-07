import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // all routes are protected

router.route("/videos").get(getLikedVideos);
router.route("toggle/c/:commentId").post(toggleCommentLike);
router.route("toggle/t/:tweetId").post(toggleTweetLike);
router.route("toggle/v/:videoId").post(toggleVideoLike);

export default router;
