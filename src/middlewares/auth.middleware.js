import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESSTOKEN_SECRET
    );

    console.log("decoded access token: ", decodedAccessToken);

    const user = await User.findById(decodedAccessToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;

    next();
    // return;
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export default verifyJWT;
