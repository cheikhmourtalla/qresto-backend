import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import logger from "../utils/logger";

/**
 * POST /products
 */
export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, description, price, categoryId, image } = req.body;
  const restaurantId = req.user?.restaurantId;

  logger.info(`Tentative de création de produit`, { name, restaurantId, userId: req.user?.id });

  try {
    if (req.user?.role === "SUPER_ADMIN") {
      logger.warn(`Accès refusé : Super Admin ne peut pas créer de produit`, { userId: req.user.id });
      return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas ajouter de produit." });
    }

    if (!restaurantId) {
      logger.warn(`Création produit échouée : restaurantId manquant`, { userId: req.user?.id });
      return res.status(400).json({ message: "ID restaurant manquant" });
    }

    const product = await prisma.product.create({
      data: { name, description, price: Number(price), categoryId: Number(categoryId), image, restaurantId },
      include: { category: true },
    });

    logger.info(`Produit créé avec succès`, { productId: product.id, name, restaurantId });

    res.status(201).json(product);
  } catch (error: any) {
    logger.error(`Erreur lors de la création du produit`, { name, restaurantId, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur création produit" });
  }
};

/**
 * GET /products
 */
export const getProducts = async (req: AuthRequest, res: Response) => {
  const restaurantId = req.user?.restaurantId;

  logger.info(`Récupération des produits`, { restaurantId, userId: req.user?.id });

  try {
    if (req.user?.role === "SUPER_ADMIN") {
      logger.warn(`Accès refusé : Super Admin ne peut pas lister les produits`, { userId: req.user.id });
      return res.status(403).json({ message: "Action interdite : En tant que Super Admin, vous n'avez pas accès à la liste des produits." });
    }

    const products = await prisma.product.findMany({
      where: { restaurantId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    logger.info(`${products.length} produit(s) retourné(s)`, { restaurantId });

    res.json(products);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des produits`, { restaurantId, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur récupération produits" });
  }
};

/**
 * PATCH /products/:id
 */
export const updateProduct = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { name, description, price, categoryId, image, available } = req.body;

  logger.info(`Tentative de mise à jour de produit`, { productId: id, userId: req.user?.id });

  try {
    if (req.user?.role === "SUPER_ADMIN") {
      logger.warn(`Accès refusé : Super Admin ne peut pas modifier un produit`, { userId: req.user.id });
      return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas modifier de produit." });
    }

    if (isNaN(id)) {
      logger.warn(`ID produit invalide`, { raw: req.params.id });
      return res.status(400).json({ message: "ID invalide" });
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      logger.warn(`Produit introuvable`, { productId: id });
      return res.status(404).json({ message: "Produit introuvable" });
    }

    if (product.restaurantId !== req.user?.restaurantId) {
      logger.warn(`Tentative de modification non autorisée sur produit`, { productId: id, userId: req.user?.id });
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const updated = await prisma.product.update({
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

    logger.info(`Produit mis à jour`, { productId: id, changes: { name, price, available } });

    res.json(updated);
  } catch (error: any) {
    logger.error(`Erreur lors de la mise à jour du produit`, { productId: id, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur mise à jour" });
  }
};

/**
 * PATCH /products/:id/toggle-availability
 */
export const toggleProductAvailability = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  logger.info(`Tentative de toggle disponibilité produit`, { productId: id, userId: req.user?.id });

  try {
    if (req.user?.role === "SUPER_ADMIN") {
      logger.warn(`Accès refusé : Super Admin ne peut pas changer la disponibilité`, { userId: req.user.id });
      return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas changer la disponibilité des produits." });
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      logger.warn(`Produit introuvable pour toggle`, { productId: id });
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    if (product.restaurantId !== req.user?.restaurantId) {
      logger.warn(`Tentative de toggle non autorisée`, { productId: id, userId: req.user?.id });
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { available: !product.available },
    });

    logger.info(`Disponibilité produit modifiée`, { productId: id, available: updated.available });

    res.json(updated);
  } catch (error: any) {
    logger.error(`Erreur lors du toggle disponibilité`, { productId: id, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur disponibilité" });
  }
};

/**
 * DELETE /products/:id
 */
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  logger.info(`Tentative de suppression de produit`, { productId: id, userId: req.user?.id });

  try {
    if (req.user?.role === "SUPER_ADMIN") {
      logger.warn(`Accès refusé : Super Admin ne peut pas supprimer un produit`, { userId: req.user.id });
      return res.status(403).json({ message: "Action interdite : Le Super Admin ne peut pas supprimer de produit." });
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      logger.warn(`Produit introuvable`, { productId: id });
      return res.status(404).json({ message: "Produit introuvable" });
    }

    if (product.restaurantId !== req.user?.restaurantId) {
      logger.warn(`Tentative de suppression non autorisée`, { productId: id, userId: req.user?.id });
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await prisma.product.delete({ where: { id } });

    logger.warn(`Produit supprimé`, { productId: id, name: product.name, restaurantId: product.restaurantId });

    res.json({ message: "Produit supprimé" });
  } catch (error: any) {
    logger.error(`Erreur lors de la suppression du produit`, { productId: id, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur suppression" });
  }
};