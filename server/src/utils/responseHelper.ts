import { Response } from "express";
import { ApiResponse, ErrorResponse } from "../types/response";
import { getErrorMessage } from "./errors";

// success helper
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = "Success",
  status = 200,
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(status).json(response);
};

export const SendError = (
  res: Response,
  error: unknown,
  code: string = "INTERNAL_SERVER_ERROR",
  status = 500,
) => {
  const response: ErrorResponse = {
    success: false,
    message: getErrorMessage(error),
    error: { code },
  };
  return res.status(status).json(response);
};
