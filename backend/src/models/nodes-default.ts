import mongoose from "mongoose";

const NodesDefault = mongoose.model(
  "NodesDefault",
  new mongoose.Schema({
    nodes: {
      type: Map,
      of: Object,
    },
    defaultMap: {
      required: false,
      type: Boolean,
    },
  })
);

export default NodesDefault;
