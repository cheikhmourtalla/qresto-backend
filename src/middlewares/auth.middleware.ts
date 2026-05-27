import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    restaurantId?: number | null;
  };
}

export interface TableRequest extends Request {
  verifiedTable?: {
    tableNumber: string;
    restaurantId: number;
    slug: string;
  };
}

// 1. Middleware de protection utilisateur (Dashboard)
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(`Token manquant`, { ip: req.ip, url: req.originalUrl });
      return res.status(401).json({ message: "Token manquant, accès refusé" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "qresto_secret";

    const decoded = jwt.verify(token, secret) as {
      id: number;
      role: string;
      restaurantId?: number | null;
    };

    logger.info(`Utilisateur authentifié`, { userId: decoded.id, role: decoded.role, restaurantId: decoded.restaurantId });

    req.user = decoded;
    next();
  } catch (error) {
    logger.warn(`Token utilisateur invalide ou expiré`, { ip: req.ip, url: req.originalUrl });
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

// 2. Middleware de vérification de table (Client)
export const verifyTableToken = (
  req: TableRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tableToken = req.headers['x-table-token'] as string;

    if (!tableToken) {
      logger.warn(`Token de table manquant`, { ip: req.ip, url: req.originalUrl });
      return res.status(401).json({ message: "Token de table requis" });
    }

    const secret = process.env.TABLE_JWT_SECRET || "qresto_table_secret";

    const decoded = jwt.verify(tableToken, secret) as {
      tableNumber: string;
      restaurantId: number;
      slug: string;
    };

    logger.info(`Token de table vérifié`, { tableNumber: decoded.tableNumber, restaurantId: decoded.restaurantId, slug: decoded.slug });

    req.verifiedTable = decoded;
    next();
  } catch (error) {
    logger.warn(`Token de table invalide`, { ip: req.ip, url: req.originalUrl });
    return res.status(401).json({ message: "Token de table invalide" });
  }
};

// 3. Middleware d'autorisation par rôle
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn(`Accès refusé : privilèges insuffisants`, { userId: req.user?.id, role: req.user?.role, required: roles });
      return res.status(403).json({
        message: "Accès refusé : Privilèges insuffisants",
      });
    }
    next();
  };
};