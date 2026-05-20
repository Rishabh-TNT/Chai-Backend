// Test file

import express from "express";

const app = express();

console.log("app started");

app.use(logger);

app.get("/", (req, res) => {
  console.log("Home");
  res.send("Home Page");
});

app.get("/users", (req, res) => {
  console.log("users");
  res.send("Users Page");
});

function logger(req, res, next) {
  console.log("log");
  next();
}

console.log("app ended");

app.listen(3000, () => {
  console.log("listening on port 3000");
});
