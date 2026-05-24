import { model, Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },

    video: {
      type: Types.ObjectId,
      ref: "Video",
    },

    owner: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timeseries: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = model("Comment", commentSchema);
