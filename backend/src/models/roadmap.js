const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    date: {
      type: Date,
      default: new Date(Date.now()),
    },
    map: [
      {
        mainKnot: {
          type: Boolean,
          default: false,
        },
        children: [String],
        id: {
          type: String,
          required: true,
          unique: true,
        },
        title: {
          type: String,
          required: true,
        },
        notes: [String],
        categoryId: {
          type: String,
        },
        status: {
          type: String,
          default: "pending",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
module.exports = Roadmap;
