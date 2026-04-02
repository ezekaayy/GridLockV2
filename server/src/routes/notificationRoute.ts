import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notificationController";
import { verifyToken } from "../utils/middlewares";

const NotificationRouter: Router = Router();

NotificationRouter.get("/", verifyToken, getNotifications);
NotificationRouter.patch("/read/:notificationId", verifyToken, markAsRead);
NotificationRouter.patch("/read-all", verifyToken, markAllAsRead);
NotificationRouter.delete("/:notificationId", verifyToken, deleteNotification);

export default NotificationRouter;
