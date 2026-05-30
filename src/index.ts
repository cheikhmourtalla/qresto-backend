import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import logger from "./utils/logger";

// Import des routes
import authRoutes from "./routes/auth.routes";
import restaurantRoutes from "./routes/restaurant.routes";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";
import menuRoutes from "./routes/menu.routes";
import uploadRoutes from "./routes/upload.routes";
import orderRoutes from "./routes/order.routes";
import waiterCallRoutes from "./routes/waiterCall.routes";

dotenv.config();

const app = express();

// --- MIDDLEWARES DE SÉCURITÉ & BASE ---

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
  "https://qresto.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Requête bloquée par CORS`, { origin });
        callback(new Error("Accès refusé par la politique CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- LOGGER HTTP (toutes les requêtes entrantes) ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logger[level](`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
});

// --- ROUTES ---

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", waiterCallRoutes);

// Route de santé
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "QResto Sénégal API fonctionne correctement",
    version: "1.0.0",
  });
});

// --- GESTION DES ERREURS ---

// 404
app.use((req: Request, res: Response) => {
  logger.warn(`Route introuvable`, { method: req.method, url: req.originalUrl, ip: req.ip });
  res.status(404).json({ message: "Route introuvable" });
});

// Erreurs globales
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Erreur non gérée`, {
    method: req.method,
    url: req.originalUrl,
    status: err.status || 500,
    message: err.message,
    stack: err.stack,
  });

  const statusCode = err.status || 500;
  const message = err.message || "Une erreur interne est survenue";

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// --- LANCEMENT DU SERVEUR ---

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Serveur démarré`, {
    url: `http://localhost:${PORT}`,
    env: process.env.NODE_ENV || "development",
  });
  console.log("--------------------------------------------------");
  console.log(`🚀 QResto Sénégal lancé sur http://localhost:${PORT}`);
  console.log(`🌍 Environnement : ${process.env.NODE_ENV || "development"}`);
  console.log("--------------------------------------------------");
});