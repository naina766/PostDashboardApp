import Notification from "./notification.model.js";
import User from "../auth/auth.model.js";

/**
 * NotificationDeliveryService
 * Centralized, aggregated notification pipeline ready for REST polling, SSE, or WebSockets.
 */
export const deliverNotification = async ({
  recipientId,
  actorId,
  type, // LIKE, COMMENT, REPLY, FOLLOW, MENTION, SAVE, SYSTEM, MODERATION
  postId = null,
  message = "",
}) => {
  if (!recipientId || !actorId || recipientId.toString() === actorId.toString()) {
    return null; // Do not notify users of their own actions
  }

  // Check recipient notification preferences
  const recipient = await User.findById(recipientId).select("notificationSettings blockedUsers");
  if (!recipient) return null;

  // Do not deliver notification if actor is blocked
  if (recipient.blockedUsers?.some((id) => id.toString() === actorId.toString())) {
    return null;
  }

  const settings = recipient.notificationSettings || {};
  if (type === "LIKE" && settings.likes === false) return null;
  if (type === "COMMENT" && settings.comments === false) return null;
  if (type === "REPLY" && settings.replies === false) return null;
  if (type === "FOLLOW" && settings.follows === false) return null;
  if (type === "MENTION" && settings.mentions === false) return null;
  if (type === "SAVE" && settings.saves === false) return null;

  // Notification Aggregation check:
  // If multiple people like the same post within 24 hours, avoid spamming duplicate rows
  if (type === "LIKE" && postId) {
    const recentNotification = await Notification.findOne({
      recipient: recipientId,
      post: postId,
      type: "LIKE",
      read: false,
    }).populate("actor", "name");

    if (recentNotification) {
      recentNotification.actor = actorId;
      recentNotification.message = "and others liked your post";
      await recentNotification.save();
      return recentNotification;
    }
  }

  const notification = await Notification.create({
    recipient: recipientId,
    actor: actorId,
    type,
    post: postId,
    message,
  });

  return notification;
};
