import express, { Express, Request, Response } from "express";

import { config } from "dotenv";

import cors, { CorsOptions } from "cors";
import { connectDb } from "./utils/db";
import ProductRouter from "./routes/productRoute";
import routes from "./routes";
import helmet from "helmet";
import path from "node:path";
import { getRelatedProducts } from "./utils/recommendation";

// Load env variavles
config();

const app: Express = express();
const port = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== "production";

// security middlewares

// helmet setup
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    hsts: isDevelopment
      ? false
      : {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
    frameguard: { action: "sameorigin" },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// CORS setup
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (Postman, mobile apps, curl)
      if (!origin) return callback(null, true);

      // In development, allow all origins
      if (isDevelopment) return callback(null, true);

      // In production, check allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`CORS blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Required for cookies
    optionsSuccessStatus: 200,
    maxAge: 86400, // Cache preflight for 24 hours
  }),
);

// other middleware
app.use(express.json({ limit: "10kb" }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api", routes);
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to Gridlock API",
    environment: process.env.NODE_ENV || "developmment",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "healty",
    timestamp: new Date().toISOString(),
  });
});

// start the server
const startServer = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`
        ╔════════════════════════════════════════╗
        ║       GRIDLOCK SERVER RUNNING.         ║
        ╠════════════════════════════════════════╣
        ║  Port: ${String(port).padEnd(32)}║
        ║  Environment: ${(process.env.NODE_ENV || "development").padEnd(25)}║
        ║  CORS: ${(isDevelopment ? "Open (Development)" : "Restricted(Production)").padEnd(32)}║
        ╚════════════════════════════════════════╝
        ${getRelatedProducts("699194a55fe90b543534e36d", 5)}
        `);
      const test = async () => {
        const result = await getRelatedProducts("69998541622483f92778bb00", 2);
        console.log(result);
      };

      test();
    });
  } catch (error) {
    console.log("Failed to start server: ", error);
    process.exit(1);
  }
};

startServer();
