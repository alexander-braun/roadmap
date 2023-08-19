const express = require("express");
require("./db/mongoose");
const UserRouter = require("./routers/users");
const TaskRouter = require("./routers/tasks");
const DefaultNodes = require("./routers/nodes-default");
const DefaultCardDataRouter = require("./routers/card-data-default");
const RoadmapRouter = require("./routers/roadmaps");
const app = express();

app.use(express.json());
app.use(UserRouter);
app.use(TaskRouter);
app.use(DefaultNodes);
app.use(DefaultCardDataRouter);
app.use(RoadmapRouter);

module.exports = app;
