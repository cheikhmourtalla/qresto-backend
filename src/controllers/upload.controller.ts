import { Response } from "express";
import cloudinary from "../utils/cloudinary";
import { AuthRequest } from "../middlewares/auth.middleware";
import logger from "../utils/logger";

/**
 * Upload d'une image sur Cloudinary
 */
export const uploadImage = async (req: AuthRequest, res: Response) => {
  logger.info(`Tentative d'upload d'image`, { userId: req.user?.id, restaurantId: req.user?.restaurantId });

  try {
    if (!req.file) {
      logger.warn(`Upload échoué : aucun fichier reçu`, { userId: req.user?.id });
      return res.status(400).json({ message: "Aucune image n'a été reçue" });
    }

    const restaurantFolder = req.user?.restaurantId
      ? `qresto/restaurant_${req.user.restaurantId}`
      : "qresto/admin_uploads";

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: restaurantFolder,
      resource_type: "image",
      transformation: [
        { width: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    logger.info(`Image uploadée avec succès`, { userId: req.user?.id, publicId: result.public_id, folder: restaurantFolder });

    res.status(201).json({
      message: "Image mise en ligne avec succès",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    logger.error(`Erreur lors de l'upload de l'image`, { userId: req.user?.id, error: error.message, stack: error.stack });
    res.status(500).json({ message: "Une erreur est survenue lors du traitement de l'image" });
  }
};