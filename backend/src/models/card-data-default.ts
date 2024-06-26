import mongoose from "mongoose";

const CardDataDefault = mongoose.model(
  "CardDataDefault",
  new mongoose.Schema({
    cards: {
      type: Map,
      of: Object,
    },
    defaultMap: {
      required: false,
      type: Boolean,
    },
  })
);

export default CardDataDefault;
