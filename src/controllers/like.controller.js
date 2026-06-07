import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  // validate the vidoid
  // delete like record for video by user if exist
  // if not deleted (not already there) create one

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");
  const userid = req.user?._id;

  const likeRemoved = await Like.findOneAndDelete({
    video: videoId,
    likedBy: userid,
  });

  let likeStatus = "unliked";

  if (!likeRemoved) {
    await Like.create({
      video: videoId,
      likedBy: userid,
    });
    likeStatus = "liked";
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { status: likeStatus },
        `Video ${likeStatus} successfully`
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");
  const userid = req.user?._id;

  const likeRemoved = await Like.findOneAndDelete({
    comment: commentId,
    likedBy: userid,
  });

  let likeStatus = "unliked";

  if (!likeRemoved) {
    await Like.create({
      comment: commentId,
      likedBy: userid,
    });
    likeStatus = "liked";
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { status: likeStatus },
        `Comment ${likeStatus} successfully`
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");
  const userid = req.user?._id;

  const likeRemoved = await Like.findOneAndDelete({
    tweet: tweetId,
    likedBy: userid,
  });

  let likeStatus = "unliked";

  if (!likeRemoved) {
    await Like.create({
      tweet: tweetId,
      likedBy: userid,
    });
    likeStatus = "liked";
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { status: likeStatus },
        `Comment ${likeStatus} successfully`
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  // get the userid
  // fetch all the like records for videos where likedby userid and video not null
  const userid = req.user?._id;

  const likedVideos = await Like.find({
    video: { $exists: true, $ne: null },
    likedBy: userid,
  }).populate("video", "videoFile thumbnail title description");

  const videos = likedVideos.map((like) => like.video);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});

export { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike };
