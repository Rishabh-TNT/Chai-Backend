import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user._id;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid channel id");

  const channel = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $addFields: {
              likesCount: { $size: "$likes" },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalSubscribers: { $size: "$subscribers" },
        totalVideos: { $size: "$videos" },
        totalVideoViews: { $sum: "$videos.views" },
        totalLikes: { $sum: "$videos.likesCount" },
      },
    },
    {
      $project: {
        totalSubscribers: 1,
        totalVideos: 1,
        totalVideoViews: 1,
        totalLikes: 1,
      },
    },
  ]);

  if (!channel?.length) throw new ApiError(40, "Channel does not exist");

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.user._id;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid channel id");

  const channel = await User.exists({ _id: userId });

  if (!channel) throw new ApiError(404, "Channel does not exist");

  const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
