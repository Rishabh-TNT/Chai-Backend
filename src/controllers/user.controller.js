import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details
  // validation of user data
  // check if user already exists
  // Check for images
  // Check for avatars
  // upload them to cloudinary
  // check for avatars uploaded on cloudinary
  // create user object -create entry in db
  // remove password and refresh token key from response
  // check for user creation
  // return res

  const { username, email, fullName, password } = req.body;

  // console.log("User data: ", { username, email, fullName, password });

  if ([fullName, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarPath = req.files?.avatar?.[0]?.path;
  const coverImagePath = req.files?.coverImage?.[0]?.path;

  if (!avatarPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required.");
  }
  // console.log("cloudinary resposne: ", cloudinaryResponse);
  const coverImage = coverImagePath
    ? await uploadOnCloudinary(coverImagePath)
    : null;

  const user = await User.create({
    username,
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url,
  });
  // console.log("user: ", user);
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log("created user: ", createdUser);
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookies

  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email required");
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in succesfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) throw new ApiError(400, "User not authorized");

  await user.findByIdAndUpdate(
    user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  return req
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiError(200, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(400, "Unauthorized request");

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const userid = decodedToken._id;

  const user = await User.findById(userid);

  if (!user || incomingRefreshToken !== user.refreshToken)
    throw new ApiError(401, "Refresh token is expired or used");

  const { accessToken, refreshToken } =
    await generateAccessandRefreshTokens(userid);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user,
          accessToken,
          refreshToken,
        },
        "Refresh Token generated successfully"
      )
    );
});

export { loginUser, logoutUser, refreshAccessToken, registerUser };
