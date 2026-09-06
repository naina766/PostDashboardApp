import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./auth.model.js";
import RefreshToken from "./refreshToken.model.js";
import AuditLog from "../admin/auditLog.model.js";
import ApiError from "../../utils/ApiError.js";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_DAYS = 7;

export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    throw new ApiError(400, "Password is required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }
};

export const generateTokens = async (user, ipAddress = "", userAgent = "") => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "default_jwt_secret_posthub",
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const rawRefreshToken = crypto.randomBytes(40).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user: user._id,
    token: hashedToken,
    expiresAt,
    ipAddress,
    userAgent,
  });

  return { accessToken, refreshToken: rawRefreshToken };
};

export const registerUser = async ({ name, email, password, username }) => {
  if (!name || !email || !password) throw new ApiError(400, "All fields required");
  validatePassword(password);

  const cleanEmail = email.toLowerCase().trim();
  const existingEmail = await User.findOne({ email: cleanEmail });
  if (existingEmail) throw new ApiError(400, "Email already exists");

  let cleanUsername = "";
  if (username && username.trim()) {
    cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      throw new ApiError(400, "Username must be at least 3 characters");
    }
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) throw new ApiError(400, "Username is already taken");
  } else {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "user";
    let candidate = base;
    let counter = 1;
    while (await User.findOne({ username: candidate })) {
      candidate = `${base}${Math.floor(100 + Math.random() * 900)}`;
      counter++;
      if (counter > 10) candidate = `${base}${Date.now().toString().slice(-4)}`;
    }
    cleanUsername = candidate;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    username: cleanUsername,
    password: hashed,
  });

  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  };
};

export const loginUser = async ({ email, password }, ipAddress = "", userAgent = "") => {
  if (!email || !password) throw new ApiError(400, "Email & password required");

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new ApiError(404, "User not found");

  if (user.isSuspended) {
    throw new ApiError(403, "Your account has been suspended by an administrator");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(400, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(user, ipAddress, userAgent);

  if (user.role === "admin" || user.role === "moderator") {
    await AuditLog.create({
      actor: user._id,
      action: "ADMIN_LOGIN",
      targetType: "SYSTEM",
      targetId: user._id,
      details: `Administrative login from ${ipAddress || "unknown IP"}`,
      ipAddress,
    });
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      coverImage: user.coverImage,
      bio: user.bio,
      location: user.location,
      website: user.website,
      skills: user.skills,
      socialLinks: user.socialLinks,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      postsCount: user.postsCount,
      role: user.role,
      isVerified: user.isVerified,
      privacy: user.privacy,
      notificationSettings: user.notificationSettings,
    },
    token: accessToken,
    accessToken,
    refreshToken,
  };
};

export const refreshSession = async (tokenString, ipAddress = "", userAgent = "") => {
  if (!tokenString) throw new ApiError(400, "Refresh token required");

  const hashed = crypto.createHash("sha256").update(tokenString).digest("hex");

  // Query by either SHA-256 hash or legacy plaintext token
  const existingToken = await RefreshToken.findOne({
    $or: [{ token: hashed }, { token: tokenString }],
    expiresAt: { $gt: new Date() },
  }).populate("user");

  if (!existingToken || !existingToken.user) {
    throw new ApiError(401, "Invalid or expired session token. Please log in again.");
  }

  // Enterprise Replay Detection: If token is already marked revoked, someone is replaying a spent token!
  if (existingToken.revoked) {
    // Invalidate all tokens for this compromised user account immediately
    await RefreshToken.updateMany({ user: existingToken.user._id }, { revoked: true });
    await AuditLog.create({
      actor: existingToken.user._id,
      action: "REPLAY_ATTACK_DETECTED",
      targetType: "SESSION",
      targetId: existingToken._id,
      details: `Replay attack detected with revoked token from IP: ${ipAddress || "unknown"}. Revoked all active sessions.`,
      ipAddress,
    });
    throw new ApiError(401, "Compromised session token detected. All active sessions have been revoked for your protection.");
  }

  if (existingToken.user.isSuspended) {
    throw new ApiError(403, "Account is suspended");
  }

  // Revoke current token (single-use rotation)
  existingToken.revoked = true;
  await existingToken.save();

  // Issue new cryptographic token pair
  const tokens = await generateTokens(existingToken.user, ipAddress, userAgent);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    token: tokens.accessToken,
  };
};

export const revokeSession = async (tokenString) => {
  if (!tokenString) return;
  const hashed = crypto.createHash("sha256").update(tokenString).digest("hex");
  await RefreshToken.findOneAndUpdate(
    { $or: [{ token: hashed }, { token: tokenString }] },
    { revoked: true }
  );
};

export const revokeAllUserSessions = async (userId) => {
  await RefreshToken.updateMany({ user: userId }, { revoked: true });
  return { message: "All sessions have been revoked" };
};
