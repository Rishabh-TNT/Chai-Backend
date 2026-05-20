// import dotenv from "dotenv";
import app from "./app.js";
import dbConnection from "./db/index.js";
const port = process.env.PORT || 8000;

// dotenv.config();

dbConnection()
  .then((conn) => {
    app.listen(port, () =>
      console.log(`Application is lisenting on port: ${port}`)
    );
  })
  .catch((err) => console.error("Failed to connect to database: ", err));
