import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      role?: string;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cookieHeader = req.headers.cookie;
    const authHeader = req.headers.authorization;
    
    let token: string | undefined;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies["token"];
    }

    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
        data: null
      });
    }

    const data = jwt.verify(token, process.env.JWT_SECRET as Secret) as { id: string, role: string };

    req.id = data.id;
    req.role = data.role;

    next();

  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again",
        data: null,
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid session, please login again",
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      data: null,
    });
  }
};
