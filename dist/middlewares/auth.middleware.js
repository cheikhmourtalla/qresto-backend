"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.verifyTableToken = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../utils/logger"));
// 1. Middleware de protection utilisateur (Dashboard)
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger_1.default.warn(`Token manquant`, { ip: req.ip, url: req.originalUrl });
            return res.status(401).json({ message: "Token manquant, accès refusé" });
        }
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || "qresto_secret";
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        logger_1.default.info(`Utilisateur authentifié`, { userId: decoded.id, role: decoded.role, restaurantId: decoded.restaurantId });
        req.user = decoded;
        next();
    }
    catch (error) {
        logger_1.default.warn(`Token utilisateur invalide ou expiré`, { ip: req.ip, url: req.originalUrl });
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};
exports.protect = protect;
// 2. Middleware de vérification de table (Client)
const verifyTableToken = (req, res, next) => {
    try {
        const tableToken = req.headers['x-table-token'];
        if (!tableToken) {
            logger_1.default.warn(`Token de table manquant`, { ip: req.ip, url: req.originalUrl });
            return res.status(401).json({ message: "Token de table requis" });
        }
        const secret = process.env.TABLE_JWT_SECRET || "qresto_table_secret";
        const decoded = jsonwebtoken_1.default.verify(tableToken, secret);
        logger_1.default.info(`Token de table vérifié`, { tableNumber: decoded.tableNumber, restaurantId: decoded.restaurantId, slug: decoded.slug });
        req.verifiedTable = decoded;
        next();
    }
    catch (error) {
        logger_1.default.warn(`Token de table invalide`, { ip: req.ip, url: req.originalUrl });
        return res.status(401).json({ message: "Token de table invalide" });
    }
};
exports.verifyTableToken = verifyTableToken;
// 3. Middleware d'autorisation par rôle
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            logger_1.default.warn(`Accès refusé : privilèges insuffisants`, { userId: req.user?.id, role: req.user?.role, required: roles });
            return res.status(403).json({
                message: "Accès refusé : Privilèges insuffisants",
            });
        }
        next();
    };
};
exports.authorize = authorize;
