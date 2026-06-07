import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  page = Math.max(Number(page), 1);
  limit = Math.min(Math.max(Number(limit), 1), 50);
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.trim()) {
    filter.title = { $regex: query.trim(), $options: "i" };
  }

  if (userId) {
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");
    filter.owner = userId;
  }

  const sortOrder = sortType === "asc" ? 1 : -1;

  const videos = await Video.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title.trim()) throw new ApiError(400, "Title is required");
  if (!description.trim()) throw new ApiError(400, "Description is required");

  const videoPath = req.files.video?.[0]?.path;
  const thumbnailPath = req.files.thumbnail?.[0].path;

  if (!videoPath || !thumbnailPath)
    throw new ApiError(400, "Both video path and thumbnail path are required");

  const video = await uploadOnCloudinary(videoPath);
  const thumbnail = await uploadOnCloudinary(thumbnailPath);

  if (!video || !thumbnail)
    throw new ApiError(400, "Both video and thumbnail required");

  const dbVideo = await Video.create({
    title,
    description,
    owner: req.user._id,
    video: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
  });

  if (!dbVideo)
    throw new ApiError(400, "Something went wrong while publishing the video");

  return res
    .status(200)
    .json(new ApiResponse(200, dbVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(400, "Video doesnt exists");

  return res
    .status(200)
    .json(new ApiResponse(400, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  let { title, description } = req.body;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  //TODO: update video details like title, description, thumbnail
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "No video found");

  if (!video.owner.equals(req.user._id))
    throw new ApiError(403, "Not authorized to update the fields");

  const updateFields = {};

  if (title?.trim()) updateFields.title = title.trim();
  if (description?.trim()) updateFields.description = description.trim();

  if (req.file?.path) {
    const thumbnail = await uploadOnCloudinary(req.file.path);

    if (!thumbnail?.url) throw new ApiError(400, "Thumbnail upload failed");

    updateFields.thumbnail = thumbnail.url;
  }

  if (Object.keys(updateFields).length == 0)
    throw new ApiError(400, "Atleast One update files is required");

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateFields,
    },
    { new: true }
  );

  if (!updatedVideo) throw new ApiError(400, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId) throw new ApiError(400, "Invalid video id");
  const video = await Video.findById(videoId);

  if (!video.owner.equals(req.user._id))
    throw new ApiError(403, "Not authorized to delete the videl");

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deleteVideo) throw new ApiError(404, "Video  not found");

  return res
    .status(200)
    .json(new ApiResponse(200, deleteVideo, "Video deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video does not exist");
  if (!video.owner.equals(req.user._id))
    throw new ApiError(
      403,
      "Not authorized to toggle the video publish status"
    );

  video.isPublished = !video.isPublished;

  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video ${video.isPublished ? "published" : "unpublished"} successfully`
      )
    );
});

export {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
};
