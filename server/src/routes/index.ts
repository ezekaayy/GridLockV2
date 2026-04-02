import { Router } from "express";
import ProductRouter from "./productRoute";
import authRouter from "./authRoute";
import CartRouter from "./cartRoute";
import NotificationRouter from "./notificationRoute";

const routes: Router = Router();

routes.use("/product", ProductRouter);
routes.use("/auth", authRouter);
routes.use("/cart", CartRouter);
routes.use("/notifications", NotificationRouter);

export default routes;
