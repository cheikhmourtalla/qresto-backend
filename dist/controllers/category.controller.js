"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategories = exports.createCategory = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * POST /categories
 */
const createCategory = async (req, res) => {
    const { name } = req.body;
    const restaurantId = req.user?.restaurantId;
    logger_1.default.info(`Tentative de création de catégorie`, { name, restaurantId, userId: req.user?.id });
    try {
        if (req.user?.role === "SUPER_ADMIN") {
            logger_1.default.warn(`Accès refusé : Super Admin ne peut pas créer de catégorie`, { userId: req.user.id });
            return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas créer de catégorie." });
        }
        if (!restaurantId) {
            logger_1.default.warn(`Création catégorie échouée : restaurantId manquant`, { userId: req.user?.id });
            return res.status(400).json({ message: "ID de restaurant manquant ou invalide" });
        }
        const category = await prisma_1.default.category.create({
            data: { name: name.trim(), restaurantId },
        });
        logger_1.default.info(`Catégorie créée avec succès`, { categoryId: category.id, name: category.name, restaurantId });
        res.status(201).json({ message: "Catégorie créée avec succès", category });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la création de la catégorie`, { name, restaurantId, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur lors de la création de la catégorie" });
    }
};
exports.createCategory = createCategory;
/**
 * GET /categories
 */
const getCategories = async (req, res) => {
    const restaurantId = req.user?.restaurantId;
    logger_1.default.info(`Récupération des catégories`, { restaurantId, userId: req.user?.id });
    try {
        if (req.user?.role === "SUPER_ADMIN") {
            logger_1.default.warn(`Accès refusé : Super Admin ne peut pas lister les catégories`, { userId: req.user.id });
            return res.status(403).json({ message: "Action interdite : En tant que Super Admin, vous n'avez pas accès à la liste des catégories." });
        }
        const categories = await prisma_1.default.category.findMany({
            where: { restaurantId },
            include: { _count: { select: { product: true } } },
            orderBy: { createdAt: "desc" },
        });
        logger_1.default.info(`${categories.length} catégorie(s) retournée(s)`, { restaurantId });
        res.json(categories);
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la récupération des catégories`, { restaurantId, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur lors de la récupération des catégories" });
    }
};
exports.getCategories = getCategories;
/**
 * PATCH /categories/:id
 */
const updateCategory = async (req, res) => {
    const categoryId = Number(req.params.id);
    const { name } = req.body;
    logger_1.default.info(`Tentative de mise à jour de catégorie`, { categoryId, name, userId: req.user?.id });
    try {
        if (req.user?.role === "SUPER_ADMIN") {
            logger_1.default.warn(`Accès refusé : Super Admin ne peut pas modifier une catégorie`, { userId: req.user.id });
            return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas modifier de catégorie." });
        }
        const category = await prisma_1.default.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            logger_1.default.warn(`Catégorie introuvable`, { categoryId });
            return res.status(404).json({ message: "Catégorie introuvable" });
        }
        if (category.restaurantId !== req.user?.restaurantId) {
            logger_1.default.warn(`Tentative de modification non autorisée sur catégorie`, { categoryId, userId: req.user?.id, ownerRestaurantId: category.restaurantId });
            return res.status(403).json({ message: "Action non autorisée sur cette catégorie" });
        }
        const updatedCategory = await prisma_1.default.category.update({
            where: { id: categoryId },
            data: { name: name.trim() },
        });
        logger_1.default.info(`Catégorie mise à jour`, { categoryId, newName: updatedCategory.name });
        res.json({ message: "Catégorie mise à jour", category: updatedCategory });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la mise à jour de la catégorie`, { categoryId, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};
exports.updateCategory = updateCategory;
/**
 * DELETE /categories/:id
 */
const deleteCategory = async (req, res) => {
    const categoryId = Number(req.params.id);
    logger_1.default.info(`Tentative de suppression de catégorie`, { categoryId, userId: req.user?.id });
    try {
        if (req.user?.role === "SUPER_ADMIN") {
            logger_1.default.warn(`Accès refusé : Super Admin ne peut pas supprimer une catégorie`, { userId: req.user.id });
            return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas supprimer de catégorie." });
        }
        const category = await prisma_1.default.category.findUnique({
            where: { id: categoryId },
            include: { _count: { select: { product: true } } },
        });
        if (!category) {
            logger_1.default.warn(`Catégorie introuvable`, { categoryId });
            return res.status(404).json({ message: "Catégorie introuvable" });
        }
        if (category.restaurantId !== req.user?.restaurantId) {
            logger_1.default.warn(`Tentative de suppression non autorisée sur catégorie`, { categoryId, userId: req.user?.id });
            return res.status(403).json({ message: "Action non autorisée" });
        }
        if (category._count.product > 0) {
            logger_1.default.warn(`Suppression bloquée : catégorie contient des produits`, { categoryId, productCount: category._count.product });
            return res.status(400).json({ message: "Impossible de supprimer une catégorie qui contient des produits. Supprimez ou déplacez les produits d'abord." });
        }
        await prisma_1.default.category.delete({ where: { id: categoryId } });
        logger_1.default.info(`Catégorie supprimée`, { categoryId });
        res.json({ message: "Catégorie supprimée avec succès" });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de la suppression de la catégorie`, { categoryId, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};
exports.deleteCategory = deleteCategory;
