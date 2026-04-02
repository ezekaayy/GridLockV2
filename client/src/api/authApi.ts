import apiClient from "./client";

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  role: "creator" | "visitor" | "admin";
}
export interface LoginData {
  password: string;
  email: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// signup
export const signup = async (
  userData: SignupData,
): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>(
    "auth/signup",
    userData,
  );
  return response.data;
};

export const login = async (
  credential: LoginData,
): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>(
    "auth/login",
    credential,
  );
  return response.data;
};

// logout --> clears teh cookie in backend
export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.get<ApiResponse<null>>("auth/logout");
  return response.data;
};

// Get current user (check session)
export const getMe = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>("auth/me");
  return response.data;
};


export default {
  signup,
  login,
  logout,
  getMe,
};
