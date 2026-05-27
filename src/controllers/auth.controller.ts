import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";
import { generateToken } from "../utils/generateToken";
import logger from "../utils/logger";

/**
 * Connexion utilisateur
 * Gère les Super Admins, Admins de Restaurant et Employés
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  logger.info(`Tentative de connexion`, { email: normalizedEmail, ip: req.ip });

  try {
    if (!email || !password) {
      logger.warn(`Connexion échouée : champs manquants`, { ip: req.ip });
      return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe" });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        restaurant: { select: { id: true, name: true, slug: true, logo: true } },
      },
    });

    if (!user) {
      logger.warn(`Connexion échouée : utilisateur introuvable`, { email: normalizedEmail });
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Connexion échouée : mot de passe incorrect`, { email: normalizedEmail, userId: user.id });
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = generateToken(user.id, user.role, user.restaurantId);

    logger.info(`Connexion réussie`, { userId: user.id, role: user.role, restaurantId: user.restaurantId });

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
  } catch (error: any) {
    logger.error(`Erreur critique lors de la connexion`, { email: normalizedEmail, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Une erreur est survenue lors de la connexion" });
  }
};