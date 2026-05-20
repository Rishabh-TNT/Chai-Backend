import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnection = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI; //.replace(/\/+$/, "");
    const connectionInstance = await mongoose.connect(`${mongoUri}${DB_NAME}`);
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
