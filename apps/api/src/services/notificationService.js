import Notification from '../models/Notification.js';

export const createNotification = async ({ recipient, complaint = null, type, title, message, metadata = {} }) => {
  if (!recipient || !type || !title || !message) {
    return null;
  }

  return Notification.create({
    recipient,
    complaint,
    type,
    title,
    message,
    metadata
  });
};

export const getNotificationsForUser = async (userId, limit = 50) => {
  return Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(limit);
};

export const markNotificationAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { isRead: true } },
    { new: true }
  );
};