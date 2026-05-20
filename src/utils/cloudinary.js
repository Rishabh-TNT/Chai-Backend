// CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@dpok25i0w
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

if (
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET ||
  !process.env.CLOUDINARY_CLOUD_NAME
) {
  console.log(
    "cloudinary wont work as cloudinary environmental variables not set"
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(localFilePath) {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File is uploaded on cloudinary: ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("Failed to upload the file: ", error);
    return null;
  }
}

export default uploadOnCloudinary;
