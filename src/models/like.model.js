import { model, Schema, Types } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Types.ObjectId,
      ref: "Video",
    },

    comment: {
      type: Types.ObjectId,
      ref: "Comment",
    },

    tweet: {
      type: Types.ObjectId,
      ref: "Tweet",
    },

    likedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Like = model("Like", likeSchema);
