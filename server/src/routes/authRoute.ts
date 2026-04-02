import { Router } from "express";
import { getMe, login, logout, signup } from "../controllers/authController";
import { verifyToken } from "../utils/middlewares";

const authRouter: Router = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/logout", logout);
authRouter.get("/me", verifyToken, getMe); 

export default authRouter;