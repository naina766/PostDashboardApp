import * as AuthService from "./auth.service.js";
import sendResponse from "../../utils/sendResponse.js";

export const registerController = async (req, res, next) => {
  try {
    const user = await AuthService.registerUser(req.body);
    sendResponse(res, { 
      statusCode: 201, 
      success: true, 
      message: "User registered", 
      data: { name: user.name, email: user.email } 
    });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const data = await AuthService.loginUser(req.body);
    sendResponse(res, { 
      statusCode: 200, 
      success: true, 
      message: "Login successful", 
      data 
    });
  } catch (err) {
    next(err);
  }
};

export const getProfileController = async (req, res, next) => {
  try {
    const user = req.user;
    sendResponse(res, { 
      statusCode: 200, 
      success: true, 
      message: "Profile fetched", 
      data: { name: user.name, email: user.email } 
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfileController = async (req, res, next) => {
  try {
    const user = req.user;
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    await user.save();
    sendResponse(res, { 
      statusCode: 200, 
      success: true, 
      message: "Profile updated", 
      data: { name: user.name, email: user.email } 
    });
  } catch (err) {
    next(err);
  }
};
