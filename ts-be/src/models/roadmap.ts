import mongoose from "mongoose";

export interface IRoadmap {
  title: string;
  subtitle: string;
  owner: typeof mongoose.Schema.Types.ObjectId;
  date: Date;
  map: {
    mainKnot: boolean;
    children: string[];
    id: string;
    title: string;
    notes: string[];
    categoryId: string;
    status: string;
  }[];
}

const roadmapSchema = new mongoose.Schema<IRoadmap>(
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

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);