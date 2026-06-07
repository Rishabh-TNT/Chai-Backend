import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (!name?.trim() || !description?.trim())
    throw new ApiError(400, "Both name and description are required");

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!playlist)
    throw new ApiError(400, "Something went wrong while creating the playlist");
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

  const playlist = await Playlist.find({ owner: userId }).populate({
    path: "videos",
    select: "-isPublished",
    populate: { path: "owner", select: "username fullName avatar" },
  });

  if (!playlist)
    throw new ApiError(400, "Something went wrong while fetching the playlist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "User Playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  const playlist = await Playlist.findById(playlistId).populate({
    path: "videos",
    select: "-isPublished",
    populate: { path: "owner", select: "username fullName avatar" },
  });

  if (!playlist) throw new ApiError(404, "No playlist found with this id");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist.owner.equals(req.user._id))
    throw new ApiError(403, "Not authorized to add video to playlist");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $push: { videos: videoId } },
    { new: true, runValidators: true }
  );

  if (!updatedPlaylist)
    throw new ApiError(400, "Something went wrong while updating the playlist");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const playlist = await Playlist.findById(playlistId);

  if (!playlist.owner.equals(req.user._id))
    throw new ApiError(403, "Not authorized to remove the video");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!updatedPlaylist)
    throw new ApiError(
      400,
      "Something went wrong while removing the video from playlist"
    );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  const playlist = await Playlist.findOneAndDelete(
    { _id: playlistId, owner: req.user._id },
    { new: true }
  );

  if (!playlist)
    throw new ApiError(
      400,
      "Either playlist doesnt exist or you are not authorized to delete it"
    );

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  const updateFields = {};
  if (name?.trim()) updateFields.name = name.trim();
  if (description?.trim()) updateFields.description = description.trim();

  if (!Object.keys(updateFields).length)
    throw new ApiError(400, "Require fields to update");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist.owner.equals(req.user._id))
    throw new ApiError(403, "Not authorized to update the playlist");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedPlaylist)
    throw new ApiError(400, "Something went wrong while updating the playlist");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
};
