"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
// Import des routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const restaurant_routes_1 = __importDefault(require("./routes/restaurant.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const menu_routes_1 = __importDefault(require("./routes/menu.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const waiterCall_routes_1 = __importDefault(require("./routes/waiterCall.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// --- MIDDLEWARES DE SÉCURITÉ & BASE ---
app.use((0, helmet_1.default)());
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:3000",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            logger_1.default.warn(`Requête bloquée par CORS`, { origin });
            callback(new Error("Accès refusé par la politique CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// --- LOGGER HTTP (toutes les requêtes entrantes) ---
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
        logger_1.default[level](`${req.method} ${req.originalUrl}`, {
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        });
    });
    next();
});
// --- ROUTES ---
app.use("/api/auth", auth_routes_1.default);
app.use("/api/restaurants", restaurant_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/menu", menu_routes_1.default);
app.use("/api/upload", upload_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api", waiterCall_routes_1.default);
// Route de santé
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "QResto Sénégal API fonctionne correctement",
        version: "1.0.0",
    });
});
// --- GESTION DES ERREURS ---
// 404
app.use((req, res) => {
    logger_1.default.warn(`Route introuvable`, { method: req.method, url: req.originalUrl, ip: req.ip });
    res.status(404).json({ message: "Route introuvable" });
});
// Erreurs globales
app.use((err, req, res, next) => {
    logger_1.default.error(`Erreur non gérée`, {
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
    logger_1.default.info(`Serveur démarré`, {
        url: `http://localhost:${PORT}`,
        env: process.env.NODE_ENV || "development",
    });
    console.log("--------------------------------------------------");
    console.log(`🚀 QResto Sénégal lancé sur http://localhost:${PORT}`);
    console.log(`🌍 Environnement : ${process.env.NODE_ENV || "development"}`);
    console.log("--------------------------------------------------");
});
