import { Request, Response } from "express";
import { IUser, User } from "../models/User";
import { SendError, sendSuccess } from "../utils/responseHelper";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";

const isDevelopment = process.env.NODE_ENV !== "production";

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "Not authenticated", "NOT_AUTHENTICATED", 401);
    }
    const user = await User.findById(req.id).select("-password");

    if (!user) {
      return SendError(res, "User not found", "USER_NOT_FOUND", 404);
    }
    return sendSuccess(res, user, "User found", 200);
  } catch (error: any) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const signup = async (req: Request, res: Response) => {
  const { name, email, phone, username, password, role } = req.body;

  try {
    if (!name || !email || !phone || !username || !password || !role) {
      return SendError(
        res,
        "Please fill all the fields",
        "MISSING_FIELDS",
        400,
      );
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      return SendError(
        res,
        "Email or username already exists",
        "USER_EXISTS",
        400,
      );
    }

    const securePassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      username: username.toLowerCase(),
      password: securePassword,
      role,
    });

    const payload = {
      id: newUser._id,
      role: newUser.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as Secret, {
      expiresIn: "7d",
    });

    const userResponse = newUser.toObject();
    delete (userResponse as any).password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: !isDevelopment, // false in dev (HTTP), true in prod (HTTPS)
      sameSite: isDevelopment ? "lax" : "none", // "lax" for same-origin dev, "none" for cross-origin prod
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    console.log(`✅ Signup successful for: ${newUser.email}`);
    return sendSuccess(res, userResponse, "Signup successful", 201);
  } catch (error: any) {
    console.error("Signup error:", error);
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    if ((!email && !username) || !password) {
      return SendError(
        res,
        "Please provide email/username and password",
        "MISSING_CREDENTIALS",
        400,
      );
    }

    const searchValue = email ? email.toLowerCase() : username.toLowerCase();
    console.log(`Login attempt for: ${searchValue}`);

    const user = await User.findOne(
      email ? { email: searchValue } : { username: searchValue },
    );

    if (!user) {
      console.log(`User not found: ${searchValue}`);
      return SendError(
        res,
        "Invalid email/username or password",
        "INVALID_CREDENTIALS",
        401,
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Invalid password for: ${searchValue}`);
      return SendError(
        res,
        "Invalid email/username or password",
        "INVALID_CREDENTIALS",
        401,
      );
    }

    const payload = {
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as Secret, {
      expiresIn: "7d",
    });

    const userResponse = user.toObject();
    delete (userResponse as any).password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "lax" : "none",
      path: "/",
    });

    console.log(`✅ Login successful for: ${user.email}`);
    return sendSuccess(res, userResponse, "Login successful", 200);
  } catch (error: any) {
    console.error("Login error:", error);
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "lax" : "none",
      path: "/",
    });
    return sendSuccess(res, null, "Logout successful", 200);
  } catch (error: any) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};
