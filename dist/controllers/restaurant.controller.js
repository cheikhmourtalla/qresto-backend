"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyRestaurant = exports.getMyRestaurant = exports.deleteRestaurant = exports.updateRestaurant = exports.getRestaurants = exports.createRestaurant = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const parseId = (raw) => {
    const id = parseInt(raw, 10);
    return isNaN(id) ? null : id;
};
/**
 * POST /restaurants
 */
const createRestaurant = async (req, res) => {
    const { name, slug, phone, address, adminName, adminEmail, adminPassword } = req.body;
    logger_1.default.info(`Tentative de création de restaurant`, { name, slug, adminEmail });
    try {
        const formattedSlug = slug.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const existingRestaurant = await prisma_1.default.restaurant.findUnique({ where: { slug: formattedSlug } });
        if (existingRestaurant) {
            logger_1.default.warn(`Slug déjà utilisé`, { slug: formattedSlug });
            return res.status(400).json({ message: "Ce slug est déjà utilisé." });
        }
        const hashedPassword = await bcrypt_1.default.hash(adminPassword, 10);
        const restaurant = await prisma_1.default.restaurant.create({
            data: {
                name, slug: formattedSlug, phone, address,
                user: {
                    create: { name: adminName, email: adminEmail.toLowerCase().trim(), password: hashedPassword, role: "RESTAURANT_ADMIN" },
                },
            },
            include: { user: { select: { id: true, name: true, email: true, role: true } } },
        });
        logger_1.default.info(`Restaurant créé avec succès`, { restaurantId: restaurant.id, slug: formattedSlug, adminEmail });
        res.status(201).json({ message: "Restaurant et compte administrateur créés avec succès", restaurant });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la création du restaurant`, { name, slug, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur lors de la création du restaurant" });
    }
};
exports.createRestaurant = createRestaurant;
/**
 * GET /restaurants
 */
const getRestaurants = async (req, res) => {
    logger_1.default.info(`Récupération de tous les restaurants`, { userId: req.user?.id, role: req.user?.role });
    try {
        const restaurants = await prisma_1.default.restaurant.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                _count: { select: { category: true, product: true, user: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        logger_1.default.info(`${restaurants.length} restaurant(s) retourné(s)`);
        res.json(restaurants);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des restaurants`, { error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur lors de la récupération des restaurants" });
    }
};
exports.getRestaurants = getRestaurants;
/**
 * PATCH /restaurants/:id
 */
const updateRestaurant = async (req, res) => {
    const id = parseId(req.params.id);
    logger_1.default.info(`Tentative de mise à jour de restaurant`, { restaurantId: id });
    try {
        if (!id) {
            logger_1.default.warn(`ID restaurant invalide`, { raw: req.params.id });
            return res.status(400).json({ message: "ID invalide" });
        }
        const { name, slug, phone, address, adminName, adminEmail, adminPassword } = req.body;
        const restaurant = await prisma_1.default.restaurant.findUnique({ where: { id }, include: { user: true } });
        if (!restaurant) {
            logger_1.default.warn(`Restaurant introuvable`, { restaurantId: id });
            return res.status(404).json({ message: "Établissement introuvable." });
        }
        let formattedSlug = undefined;
        if (slug) {
            formattedSlug = slug.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
            if (formattedSlug !== restaurant.slug) {
                const existingSlug = await prisma_1.default.restaurant.findUnique({ where: { slug: formattedSlug } });
                if (existingSlug) {
                    logger_1.default.warn(`Slug déjà utilisé`, { slug: formattedSlug, restaurantId: id });
                    return res.status(400).json({ message: "Ce slug est déjà utilisé par un autre établissement." });
                }
            }
        }
        const adminUser = restaurant.user.find((u) => u.role === "RESTAURANT_ADMIN");
        let userUpdateData = {};
        if (adminName)
            userUpdateData.name = adminName;
        if (adminEmail)
            userUpdateData.email = adminEmail.toLowerCase().trim();
        if (adminPassword && adminPassword.trim() !== "") {
            userUpdateData.password = await bcrypt_1.default.hash(adminPassword, 10);
        }
        await prisma_1.default.$transaction(async (tx) => {
            if (adminUser && Object.keys(userUpdateData).length > 0) {
                await tx.user.update({ where: { id: adminUser.id }, data: userUpdateData });
            }
            await tx.restaurant.update({
                where: { id },
                data: { name: name || restaurant.name, slug: formattedSlug || restaurant.slug, phone: phone !== undefined ? phone : restaurant.phone, address: address !== undefined ? address : restaurant.address },
            });
        });
        logger_1.default.info(`Restaurant mis à jour`, { restaurantId: id, slug: formattedSlug || restaurant.slug });
        return res.json({ message: "Établissement et accès administrateur mis à jour !" });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la mise à jour du restaurant`, { restaurantId: id, error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Erreur lors de la mise à jour de l'établissement." });
    }
};
exports.updateRestaurant = updateRestaurant;
/**
 * DELETE /restaurants/:id
 */
const deleteRestaurant = async (req, res) => {
    const id = parseId(req.params.id);
    logger_1.default.info(`Tentative de suppression de restaurant`, { restaurantId: id });
    try {
        if (!id) {
            logger_1.default.warn(`ID restaurant invalide`, { raw: req.params.id });
            return res.status(400).json({ message: "ID invalide" });
        }
        const restaurant = await prisma_1.default.restaurant.findUnique({ where: { id } });
        if (!restaurant) {
            logger_1.default.warn(`Restaurant introuvable`, { restaurantId: id });
            return res.status(404).json({ message: "Restaurant introuvable" });
        }
        await prisma_1.default.restaurant.delete({ where: { id } });
        logger_1.default.warn(`Restaurant supprimé`, { restaurantId: id, name: restaurant.name });
        res.json({ message: "Restaurant supprimé avec succès" });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la suppression du restaurant`, { restaurantId: id, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur lors de la suppression du restaurant" });
    }
};
exports.deleteRestaurant = deleteRestaurant;
/**
 * GET /restaurants/me
 */
const getMyRestaurant = async (req, res) => {
    const restaurantId = req.user?.restaurantId;
    logger_1.default.info(`Récupération du restaurant lié au compte`, { restaurantId, userId: req.user?.id });
    try {
        if (!restaurantId) {
            logger_1.default.warn(`Aucun restaurant associé au compte`, { userId: req.user?.id });
            return res.status(404).json({ message: "Aucun restaurant associé à votre compte" });
        }
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: restaurantId },
            include: { _count: { select: { category: true, product: true } } },
        });
        if (!restaurant) {
            logger_1.default.warn(`Restaurant introuvable`, { restaurantId });
            return res.status(404).json({ message: "Restaurant introuvable" });
        }
        logger_1.default.info(`Restaurant retourné`, { restaurantId, name: restaurant.name });
        res.json(restaurant);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération du restaurant`, { restaurantId, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getMyRestaurant = getMyRestaurant;
/**
 * PUT /restaurants/me
 */
const updateMyRestaurant = async (req, res) => {
    const restaurantId = req.user?.restaurantId;
    const { name, phone, address, logo, banner } = req.body;
    logger_1.default.info(`Tentative de mise à jour du restaurant (admin)`, { restaurantId, userId: req.user?.id });
    try {
        if (!restaurantId) {
            logger_1.default.warn(`Mise à jour refusée : aucun restaurant associé`, { userId: req.user?.id });
            return res.status(403).json({ message: "Action non autorisée" });
        }
        const updatedRestaurant = await prisma_1.default.restaurant.update({
            where: { id: restaurantId },
            data: { name, phone, address, logo, banner },
        });
        logger_1.default.info(`Restaurant mis à jour par son admin`, { restaurantId, name: updatedRestaurant.name });
        res.json({ message: "Configuration mise à jour", restaurant: updatedRestaurant });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la mise à jour du restaurant`, { restaurantId, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};
exports.updateMyRestaurant = updateMyRestaurant;
