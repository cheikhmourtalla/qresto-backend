"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicMenu = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const getPublicMenu = async (req, res) => {
    const slug = req.params.slug;
    logger_1.default.info(`Accès menu public`, { slug, ip: req.ip });
    try {
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { slug },
            include: { category: { include: { product: true } } },
        });
        if (!restaurant) {
            logger_1.default.warn(`Menu introuvable`, { slug });
            return res.status(404).json({ message: "Restaurant introuvable" });
        }
        logger_1.default.info(`Menu retourné`, { slug, restaurantId: restaurant.id, categories: restaurant.category.length });
        res.json(restaurant);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération du menu public`, { slug, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur lors de la récupération du menu" });
    }
};
exports.getPublicMenu = getPublicMenu;
