import express, { Express, Request, Response } from "express";
import path from "path";
import app from "./app";

const dotenv = require("dotenv");
dotenv.config();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

// Determine the correct directory for static files
const basePath = path.join(__dirname, "../frontend/dist/apps/roadmap");

console.log(
  process.env.NODE_ENV,
  "------------IS PRODUCTION? ",
  process.env.NODE_ENV === "PRODUCTION",
  "-------------"
);
if (process.env.NODE_ENV === "PRODUCTION") {
  console.log("IS PRODUCTION");
  console.log("Static files served from:", basePath);
  console.log("Index file served from:", path.join(basePath, "index.html"));

  app.use(express.static(basePath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(basePath, "index.html"));
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
