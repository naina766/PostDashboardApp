import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    bio: { type: String, default: "", maxLength: 300, trim: true },
    location: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    skills: [{ type: String, trim: true }],
    socialLinks: {
      github: { type: String, default: "", trim: true },
      twitter: { type: String, default: "", trim: true },
      linkedin: { type: String, default: "", trim: true },
    },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    mutedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    privacy: {
      profileVisibility: { type: String, enum: ["public", "private"], default: "public" },
      whoCanComment: { type: String, enum: ["everyone", "following"], default: "everyone" },
      whoCanMention: { type: String, enum: ["everyone", "following"], default: "everyone" },
    },
    notificationSettings: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      replies: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      saves: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

