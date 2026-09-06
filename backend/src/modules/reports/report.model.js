import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["POST", "COMMENT", "USER"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ["SPAM", "HARASSMENT", "HATE", "VIOLENCE", "SEXUAL", "MISLEADING", "OTHER"],
      required: true,
    },
    details: {
      type: String,
      default: "",
      maxLength: 1000,
    },
    status: {
      type: String,
      enum: ["PENDING", "RESOLVED", "DISMISSED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
