import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.model.js";
import ApiError from "../utils/ApiError.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, "User not found");
    if (user.isSuspended) {
      throw new ApiError(403, "Your account has been suspended by an administrator");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && !user.isSuspended) {
          req.user = user;
        }
      } catch {
        // Ignore invalid token in optional auth
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: Insufficient privileges"));
    }
    next();
  };
};
