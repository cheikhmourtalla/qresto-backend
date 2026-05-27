import { Request, Response } from "express";
import prisma from "../prisma";
import logger from "../utils/logger";

export const getPublicMenu = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  logger.info(`Accès menu public`, { slug, ip: req.ip });

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: { category: { include: { product: true } } },
    });

    if (!restaurant) {
      logger.warn(`Menu introuvable`, { slug });
      return res.status(404).json({ message: "Restaurant introuvable" });
    }

    logger.info(`Menu retourné`, { slug, restaurantId: restaurant.id, categories: restaurant.category.length });

    res.json(restaurant);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération du menu public`, { slug, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Erreur lors de la récupération du menu" });
  }
};