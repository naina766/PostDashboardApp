import Notification from "./notification.model.js";
import ApiError from "../../utils/ApiError.js";

export const getUserNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const total = await Notification.countDocuments({ recipient: userId });
  const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

  const notifications = await Notification.find({ recipient: userId })
    .populate("actor", "name username avatar isVerified")
    .populate("post", "title content postType")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    notifications,
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasNextPage: pageNum * limitNum < total,
    },
  };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );

  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, read: false }, { read: true });
  return { success: true, message: "All notifications marked as read" };
};

export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ recipient: userId, read: false });
  return { unreadCount: count };
};
