"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Génère un token JWT harmonisé pour QResto Sénégal
 */
const generateToken = (id, // On utilise 'id' pour correspondre au middleware et au contrôleur
role, restaurantId) => {
    // On s'assure que le secret existe, sinon on utilise la valeur par défaut du projet
    const secret = process.env.JWT_SECRET || "qresto_secret";
    return jsonwebtoken_1.default.sign({
        id, // Doit être 'id' et non 'userId' pour être reconnu par ton middleware protect
        role,
        restaurantId,
    }, secret, {
        expiresIn: "30d", // Augmenté à 30 jours pour ton confort de développement
    });
};
exports.generateToken = generateToken;
