import User from "./auth.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiError from "../../utils/ApiError.js";

export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) throw new ApiError(400, "All fields required");
  
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, "Email already exists");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  return user;
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) throw new ApiError(400, "Email & password required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(400, "Invalid credentials");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  return { user, token };
};
