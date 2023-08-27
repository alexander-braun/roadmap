import express, { Express, Request, Response } from "express";

require("./db/mongoose");
/*
const UserRouter = require("./routers/users");
const TaskRouter = require("./routers/tasks");
const DefaultNodes = require("./routers/nodes-default");
const DefaultCardDataRouter = require("./routers/card-data-default");
const RoadmapRouter = require("./routers/roadmaps");
*/
import UserRouter from "./routers/users";
import DefaultNodes from "./routers/nodes-default";
import DefaultCardDataRouter from "./routers/card-data-default";
import RoadmapRouter from "./routers/roadmaps";
const app = express();

app.use(express.json());

app.use(UserRouter);
app.use(DefaultNodes);
app.use(DefaultCardDataRouter);
app.use(RoadmapRouter);

export default app;
