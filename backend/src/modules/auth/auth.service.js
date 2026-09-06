import User from "./auth.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiError from "../../utils/ApiError.js";

export const registerUser = async ({ name, email, password, username }) => {
  if (!name || !email || !password) throw new ApiError(400, "All fields required");
  
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
    // Generate unique username from name
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

export const loginUser = async ({ email, password }) => {
  if (!email || !password) throw new ApiError(400, "Email & password required");

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new ApiError(404, "User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(400, "Invalid credentials");

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
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
    }, 
    token 
  };
};
