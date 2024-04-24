import express, { Express, Request, Response } from "express";
import path from "path";
import app from "./app";

const port = process.env.PORT || 3000; // Default to 3000 if PORT is not set

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // Update to match the domain you will make the request from if needed
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

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

if (process.env.NODE_ENV === "PRODUCTION") {
  console.log("IS PRODUCTION");
  app.use(express.static("../frontend/dist"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}
