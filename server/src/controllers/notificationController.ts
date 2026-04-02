import { Request, Response } from "express";
import { Notification } from "../models/Notification";
import { SendError, sendSuccess } from "../utils/responseHelper";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: req.id }),
      Notification.countDocuments({ recipient: req.id, read: false })
    ]);

    return sendSuccess(res, {
      notifications,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    }, "Notifications found");
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return SendError(res, "Notification not found", "NOT_FOUND", 404);
    }

    return sendSuccess(res, notification, "Notification marked as read");
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    await Notification.updateMany(
      { recipient: req.id, read: false },
      { read: true }
    );

    return sendSuccess(res, null, "All notifications marked as read");
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.id
    });

    if (!notification) {
      return SendError(res, "Notification not found", "NOT_FOUND", 404);
    }

    return sendSuccess(res, null, "Notification deleted");
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};
