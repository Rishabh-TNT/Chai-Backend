import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Invalid channel id");

  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }
  // TODO: toggle subscription
  // check for userid in subscriber of channel and delete
  // if not create a document with channel and userid

  const deletedSubscription = await Subscription.findOneAndDelete({
    channel: channelId,
    subscriber: req.user._id,
  });

  let subscriptionStatus = "unsubscribed";

  if (!deletedSubscription) {
    await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });

    subscriptionStatus = "subscribed";
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriptionStatus },
        `channel ${subscriptionStatus} successfully`
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  //  check for channel id validity
  // query for subscription documents for channel with channelId
  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Invalid channel id");

  const channel = await User.findById(channelId);

  if (!channel) throw new ApiError(404, "Channel doesn't exist");

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "username fullName avatar"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Channel Subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // check for subscriberId validity
  // check for existance of subscriber
  // fetch channelIds from subscription and populate with channel(user) data
  if (!isValidObjectId(subscriberId))
    throw new ApiError(400, "Invalid subscriber id");

  const user = await User.findById(subscriberId).select("_id");
  if (!user) throw new ApiError(404, "Subscriber doesn't exist");

  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "username fullName avatar");

  const channels = subscriptions.map((subscription) => subscription.channel);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels,
        "List of channels subscribed to fetched successfully"
      )
    );
});

export { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription };
