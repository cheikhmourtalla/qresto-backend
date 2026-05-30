"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../prisma"));
const generateToken_1 = require("../utils/generateToken");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Connexion utilisateur
 * Gère les Super Admins, Admins de Restaurant et Employés
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    logger_1.default.info(`Tentative de connexion`, { email: normalizedEmail, ip: req.ip });
    try {
        if (!email || !password) {
            logger_1.default.warn(`Connexion échouée : champs manquants`, { ip: req.ip });
            return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email: normalizedEmail },
            include: {
                restaurant: { select: { id: true, name: true, slug: true, logo: true } },
            },
        });
        if (!user) {
            logger_1.default.warn(`Connexion échouée : utilisateur introuvable`, { email: normalizedEmail });
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            logger_1.default.warn(`Connexion échouée : mot de passe incorrect`, { email: normalizedEmail, userId: user.id });
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        const token = (0, generateToken_1.generateToken)(user.id, user.role, user.restaurantId);
        logger_1.default.info(`Connexion réussie`, { userId: user.id, role: user.role, restaurantId: user.restaurantId });
        res.json({
            status: "success",
            qresto_token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantId: user.restaurantId,
                restaurant: user.restaurant,
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Erreur critique lors de la connexion`, { email: normalizedEmail, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Une erreur est survenue lors de la connexion" });
    }
};
exports.login = login;
