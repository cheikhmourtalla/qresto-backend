"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.toggleProductAvailability = exports.updateProduct = exports.getProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * POST /products
 */
const createProduct = async (req, res) => {
    const { name, description, price, categoryId, image } = req.body;
    const restaurantId = req.user?.restaurantId;
    logger_1.default.info(`Tentative de création de produit`, { name, restaurantId, userId: req.user?.id });
    try {
        if (req.user?.role === "SUPER_ADMIN") {
            logger_1.default.warn(`Accès refusé : Super Admin ne peut pas créer de produit`, { userId: req.user.id });
            return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas ajouter de produit." });
        }
        if (!restaurantId) {
            logger_1.default.warn(`Création produit échouée : restaurantId manquant`, { userId: req.user?.id });
            return res.status(400).json({ message: "ID restaurant manquant" });
        }
        const product = await prisma_1.default.product.create({
            data: { name, description, price: Number(price), categoryId: Number(categoryId), image, restaurantId },
            include: { category: true },
        });
        logger_1.default.info(`Produit créé avec succès`, { productId: product.id, name, restaurantId });
        res.status(201).json(product);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la création du produit`, { name, restaurantId, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur création produit" });
    }
};
exports.createProduct = createProduct;
/**
 * GET /products
 */
const getProducts = async (req, res) => {
    const restaurantId = req.user?.restaurantId;
    logger_1.default.info(`Récupération des produits`, { restaurantId, userId: req.user?.id });
    try {
        if (req.user?.role === "SUPER_ADMIN") {
            logger_1.default.warn(`Accès refusé : Super Admin ne peut pas lister les produits`, { userId: req.user.id });
            return res.status(403).json({ message: "Action interdite : En tant que Super Admin, vous n'avez pas accès à la liste des produits." });
        }
        const products = await prisma_1.default.product.findMany({
            where: { restaurantId },
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });
        logger_1.default.info(`${products.length} produit(s) retourné(s)`, { restaurantId });
        res.json(products);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des produits`, { restaurantId, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur récupération produits" });
    }
};
exports.getProducts = getProducts;
/**
 * PATCH /products/:id
 */
const updateProduct = async (req, res) => {
    const id = Number(req.params.id);
    const { name, description, price, categoryId, image, available } = req.body;
    logger_1.default.info(`Tentative de mise à jour de produit`, { productId: id, userId: req.user?.id });
    try {
        if (req.user?.role === "SUPER_ADMIN") {
            logger_1.default.warn(`Accès refusé : Super Admin ne peut pas modifier un produit`, { userId: req.user.id });
            return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas modifier de produit." });
        }
        if (isNaN(id)) {
            logger_1.default.warn(`ID produit invalide`, { raw: req.params.id });
            return res.status(400).json({ message: "ID invalide" });
        }
        const product = await prisma_1.default.product.findUnique({ where: { id } });
        if (!product) {
            logger_1.default.warn(`Produit introuvable`, { productId: id });
            return res.status(404).json({ message: "Produit introuvable" });
        }
        if (product.restaurantId !== req.user?.restaurantId) {
            logger_1.default.warn(`Tentative de modification non autorisée sur produit`, { productId: id, userId: req.user?.id });
            return res.status(403).json({ message: "Action non autorisée" });
        }
        const updated = await prisma_1.default.product.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: Number(price) }),
                ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
                ...(image !== undefined && { image }),
                ...(available !== undefined && { available }),
            },
            include: { category: true },
        });
        logger_1.default.info(`Produit mis à jour`, { productId: id, changes: { name, price, available } });
        res.json(updated);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la mise à jour du produit`, { productId: id, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur mise à jour" });
    }
};
exports.updateProduct = updateProduct;
/**
 * PATCH /products/:id/toggle-availability
 */
const toggleProductAvailability = async (req, res) => {
    const id = Number(req.params.id);
    logger_1.default.info(`Tentative de toggle disponibilité produit`, { productId: id, userId: req.user?.id });
    try {
        if (req.user?.role === "SUPER_ADMIN") {
            logger_1.default.warn(`Accès refusé : Super Admin ne peut pas changer la disponibilité`, { userId: req.user.id });
            return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas changer la disponibilité des produits." });
        }
        const product = await prisma_1.default.product.findUnique({ where: { id } });
        if (!product) {
            logger_1.default.warn(`Produit introuvable pour toggle`, { productId: id });
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        if (product.restaurantId !== req.user?.restaurantId) {
            logger_1.default.warn(`Tentative de toggle non autorisée`, { productId: id, userId: req.user?.id });
            return res.status(403).json({ message: "Action non autorisée" });
        }
        const updated = await prisma_1.default.product.update({
            where: { id },
            data: { available: !product.available },
        });
        logger_1.default.info(`Disponibilité produit modifiée`, { productId: id, available: updated.available });
        res.json(updated);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors du toggle disponibilité`, { productId: id, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur disponibilité" });
    }
};
exports.toggleProductAvailability = toggleProductAvailability;
/**
 * DELETE /products/:id
 */
const deleteProduct = async (req, res) => {
    const id = Number(req.params.id);
    logger_1.default.info(`Tentative de suppression de produit`, { productId: id, userId: req.user?.id });
    try {
        if (req.user?.role === "SUPER_ADMIN") {
            logger_1.default.warn(`Accès refusé : Super Admin ne peut pas supprimer un produit`, { userId: req.user.id });
            return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas supprimer de produit." });
        }
        const product = await prisma_1.default.product.findUnique({ where: { id } });
        if (!product) {
            logger_1.default.warn(`Produit introuvable`, { productId: id });
            return res.status(404).json({ message: "Produit introuvable" });
        }
        if (product.restaurantId !== req.user?.restaurantId) {
            logger_1.default.warn(`Tentative de suppression non autorisée`, { productId: id, userId: req.user?.id });
            return res.status(403).json({ message: "Action non autorisée" });
        }
        await prisma_1.default.product.delete({ where: { id } });
        logger_1.default.warn(`Produit supprimé`, { productId: id, name: product.name, restaurantId: product.restaurantId });
        res.json({ message: "Produit supprimé" });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la suppression du produit`, { productId: id, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur suppression" });
    }
};
exports.deleteProduct = deleteProduct;
