import * as NotificationService from "./notification.service.js";
import sendResponse from "../../utils/sendResponse.js";

export const getNotificationsController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await NotificationService.getUserNotifications(req.user._id, {
      page,
      limit,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notifications fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const markAsReadController = async (req, res, next) => {
  try {
    const result = await NotificationService.markAsRead(
      req.params.id,
      req.user._id
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const markAllAsReadController = async (req, res, next) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user._id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getUnreadCountController = async (req, res, next) => {
  try {
    const result = await NotificationService.getUnreadCount(req.user._id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Unread count fetched",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
