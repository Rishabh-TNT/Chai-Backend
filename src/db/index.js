import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dotenv.config();

const dbConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      "Connection to database established: ",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.error("Failed to connect to database: ", error);
    process.exit(1);
  }
};

export default dbConnection;
