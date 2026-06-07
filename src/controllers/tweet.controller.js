import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  // get owner from req passed by jwt auth middlware
  // get content and check for validity
  // create a document in tweet collection with content and userid as owner

  const owner = req.user?._id;
  if (!owner) throw new ApiError(401, "Unauthorized request"); // Owner is not validated in model as not marked required

  const content = req.body.content?.trim();
  if (!content) throw new ApiError(400, "Tweet content is required");

  const tweet = await Tweet.create({
    content,
    owner,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet successfully created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  // get the user from url params
  // fetch all tweet documents with user as owner
  // populate user in tweets
  // sort with newest first

  const userId = req.params.userId;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

  const tweets = await Tweet.find({
    owner: userId,
  })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  // get the tweet id form url
  // get the new content from req body
  // update the tweet
  const tweetId = req.params.tweetId;
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");

  const newContent = req.body.content?.trim();
  if (!newContent) throw new ApiError(400, "Tweet content required");

  const updatedTweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user._id },
    {
      $set: {
        content: newContent,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) throw new ApiError(404, "Tweet not found");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  // get the tweetid and verify  user is the owner
  // delete the tweet
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");

  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });

  if (!deletedTweet)
    throw new ApiError(404, "Tweet not found or you are not authorized");

  return res.status(200).json(200, deleteTweet, "Tweet deleted successfully");
});

export { createTweet, deleteTweet, getUserTweets, updateTweet };
