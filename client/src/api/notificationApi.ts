import apiClient from "./client";

export interface Notification {
  _id: string;
  recipient: string;
  type: "new_order" | "product_sold" | "payment_received" | "system";
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const getNotifications = async (
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<NotificationsResponse>> => {
  const response = await apiClient.get<ApiResponse<NotificationsResponse>>(
    `/notifications/?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const markAsRead = async (
  notificationId: string
): Promise<ApiResponse<Notification>> => {
  const response = await apiClient.patch<ApiResponse<Notification>>(
    `/notifications/read/${notificationId}`
  );
  return response.data;
};

export const markAllAsRead = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.patch<ApiResponse<null>>(
    "/notifications/read-all"
  );
  return response.data;
};

export const deleteNotification = async (
  notificationId: string
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/notifications/${notificationId}`
  );
  return response.data;
};
