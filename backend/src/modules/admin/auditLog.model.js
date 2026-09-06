import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "USER_ROLE_CHANGE",
        "USER_SUSPENDED",
        "USER_RESTORED",
        "CONTENT_REMOVED",
        "REPORT_RESOLVED",
        "REPORT_DISMISSED",
        "ADMIN_LOGIN",
      ],
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["USER", "POST", "COMMENT", "REPORT", "SYSTEM"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    details: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
