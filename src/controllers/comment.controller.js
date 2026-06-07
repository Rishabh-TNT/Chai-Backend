import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  // get videoid, page and number to fetch comments for
  // convert them to number explicitly
  // create bounds for the same
  // comments can be so many limit the result using pagination
  // get page number and limit per page from url query

  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");
  //   const { page = 1, limit = 10 } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

  const skip = (page - 1) * limit;

  const comments = await Comment.find({
    video: videoId,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        pagination: {
          page,
          limit,
          totalComments,
          totalPages: Math.ceil(totalComments / limit),
          hasNextPage: page < Math.ceil(totalComments / limit),
          hasPrevPage: page > 1,
        },
      },
      "Video comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");
  const content = req.body.content?.trim();

  if (!content) throw new ApiError(400, "Comment is required");

  const comment = await Comment.create({
    video: videoId,
    content,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, comment, "Comment on video posted successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");
  const newComment = req.body.content?.trim();

  if (!newComment) throw new ApiError(400, "Comment is required");

  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: req.user._id },
    { $set: { content: newComment } },
    { new: true }
  );

  if (!updatedComment)
    throw new ApiError(
      404,
      "Comment not found or you are not allowed to update it"
    );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");

  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  });

  if (!deletedComment)
    throw new ApiError(
      404,
      "Comment not found or you are not allowed to delete it"
    );

  return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted succesfully"));
});

export { addComment, deleteComment, getVideoComments, updateComment };
