import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import logger from "../utils/logger";

const parseId = (raw: string): number | null => {
  const id = parseInt(raw, 10);
  return isNaN(id) ? null : id;
};

/**
 * POST /restaurants
 */
export const createRestaurant = async (req: Request, res: Response) => {
  const { name, slug, phone, address, adminName, adminEmail, adminPassword } = req.body;

  logger.info(`Tentative de création de restaurant`, { name, slug, adminEmail });

  try {
    const formattedSlug = slug.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

    const existingRestaurant = await prisma.restaurant.findUnique({ where: { slug: formattedSlug } });

    if (existingRestaurant) {
      logger.warn(`Slug déjà utilisé`, { slug: formattedSlug });
      return res.status(400).json({ message: "Ce slug est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const restaurant = await prisma.restaurant.create({
      data: {
        name, slug: formattedSlug, phone, address,
        user: {
          create: { name: adminName, email: adminEmail.toLowerCase().trim(), password: hashedPassword, role: "RESTAURANT_ADMIN" },
        },
      },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    logger.info(`Restaurant créé avec succès`, { restaurantId: restaurant.id, slug: formattedSlug, adminEmail });

    res.status(201).json({ message: "Restaurant et compte administrateur créés avec succès", restaurant });
  } catch (error: any) {
    logger.error(`Erreur lors de la création du restaurant`, { name, slug, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur lors de la création du restaurant" });
  }
};

/**
 * GET /restaurants
 */
export const getRestaurants = async (req: AuthRequest, res: Response) => {
  logger.info(`Récupération de tous les restaurants`, { userId: req.user?.id, role: req.user?.role });

  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { category: true, product: true, user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    logger.info(`${restaurants.length} restaurant(s) retourné(s)`);

    res.json(restaurants);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des restaurants`, { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur lors de la récupération des restaurants" });
  }
};

/**
 * PATCH /restaurants/:id
 */
export const updateRestaurant = async (req: Request, res: Response) => {
  const id = parseId(req.params.id as string);

  logger.info(`Tentative de mise à jour de restaurant`, { restaurantId: id });

  try {
    if (!id) {
      logger.warn(`ID restaurant invalide`, { raw: req.params.id });
      return res.status(400).json({ message: "ID invalide" });
    }

    const { name, slug, phone, address, adminName, adminEmail, adminPassword } = req.body;

    const restaurant = await prisma.restaurant.findUnique({ where: { id }, include: { user: true } });

    if (!restaurant) {
      logger.warn(`Restaurant introuvable`, { restaurantId: id });
      return res.status(404).json({ message: "Établissement introuvable." });
    }

    let formattedSlug = undefined;
    if (slug) {
      formattedSlug = slug.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
      if (formattedSlug !== restaurant.slug) {
        const existingSlug = await prisma.restaurant.findUnique({ where: { slug: formattedSlug } });
        if (existingSlug) {
          logger.warn(`Slug déjà utilisé`, { slug: formattedSlug, restaurantId: id });
          return res.status(400).json({ message: "Ce slug est déjà utilisé par un autre établissement." });
        }
      }
    }

    const adminUser = restaurant.user.find((u) => u.role === "RESTAURANT_ADMIN");

    let userUpdateData: any = {};
    if (adminName) userUpdateData.name = adminName;
    if (adminEmail) userUpdateData.email = adminEmail.toLowerCase().trim();
    if (adminPassword && adminPassword.trim() !== "") {
      userUpdateData.password = await bcrypt.hash(adminPassword, 10);
    }

    await prisma.$transaction(async (tx) => {
      if (adminUser && Object.keys(userUpdateData).length > 0) {
        await tx.user.update({ where: { id: adminUser.id }, data: userUpdateData });
      }
      await tx.restaurant.update({
        where: { id },
        data: { name: name || restaurant.name, slug: formattedSlug || restaurant.slug, phone: phone !== undefined ? phone : restaurant.phone, address: address !== undefined ? address : restaurant.address },
      });
    });

    logger.info(`Restaurant mis à jour`, { restaurantId: id, slug: formattedSlug || restaurant.slug });

    return res.json({ message: "Établissement et accès administrateur mis à jour !" });
  } catch (error: any) {
    logger.error(`Erreur lors de la mise à jour du restaurant`, { restaurantId: id, error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Erreur lors de la mise à jour de l'établissement." });
  }
};

/**
 * DELETE /restaurants/:id
 */
export const deleteRestaurant = async (req: Request, res: Response) => {
  const id = parseId(req.params.id as string);

  logger.info(`Tentative de suppression de restaurant`, { restaurantId: id });

  try {
    if (!id) {
      logger.warn(`ID restaurant invalide`, { raw: req.params.id });
      return res.status(400).json({ message: "ID invalide" });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id } });

    if (!restaurant) {
      logger.warn(`Restaurant introuvable`, { restaurantId: id });
      return res.status(404).json({ message: "Restaurant introuvable" });
    }

    await prisma.restaurant.delete({ where: { id } });

    logger.warn(`Restaurant supprimé`, { restaurantId: id, name: restaurant.name });

    res.json({ message: "Restaurant supprimé avec succès" });
  } catch (error: any) {
    logger.error(`Erreur lors de la suppression du restaurant`, { restaurantId: id, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur lors de la suppression du restaurant" });
  }
};

/**
 * GET /restaurants/me
 */
export const getMyRestaurant = async (req: AuthRequest, res: Response) => {
  const restaurantId = req.user?.restaurantId;

  logger.info(`Récupération du restaurant lié au compte`, { restaurantId, userId: req.user?.id });

  try {
    if (!restaurantId) {
      logger.warn(`Aucun restaurant associé au compte`, { userId: req.user?.id });
      return res.status(404).json({ message: "Aucun restaurant associé à votre compte" });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { _count: { select: { category: true, product: true } } },
    });

    if (!restaurant) {
      logger.warn(`Restaurant introuvable`, { restaurantId });
      return res.status(404).json({ message: "Restaurant introuvable" });
    }

    logger.info(`Restaurant retourné`, { restaurantId, name: restaurant.name });

    res.json(restaurant);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération du restaurant`, { restaurantId, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * PUT /restaurants/me
 */
export const updateMyRestaurant = async (req: AuthRequest, res: Response) => {
  const restaurantId = req.user?.restaurantId;
  const { name, phone, address, logo, banner } = req.body;

  logger.info(`Tentative de mise à jour du restaurant (admin)`, { restaurantId, userId: req.user?.id });

  try {
    if (!restaurantId) {
      logger.warn(`Mise à jour refusée : aucun restaurant associé`, { userId: req.user?.id });
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { name, phone, address, logo, banner },
    });

    logger.info(`Restaurant mis à jour par son admin`, { restaurantId, name: updatedRestaurant.name });

    res.json({ message: "Configuration mise à jour", restaurant: updatedRestaurant });
  } catch (error: any) {
    logger.error(`Erreur lors de la mise à jour du restaurant`, { restaurantId, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};