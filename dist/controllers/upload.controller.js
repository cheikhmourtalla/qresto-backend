"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Upload d'une image sur Cloudinary
 */
const uploadImage = async (req, res) => {
    logger_1.default.info(`Tentative d'upload d'image`, { userId: req.user?.id, restaurantId: req.user?.restaurantId });
    try {
        if (!req.file) {
            logger_1.default.warn(`Upload échoué : aucun fichier reçu`, { userId: req.user?.id });
            return res.status(400).json({ message: "Aucune image n'a été reçue" });
        }
        const restaurantFolder = req.user?.restaurantId
            ? `qresto/restaurant_${req.user.restaurantId}`
            : "qresto/admin_uploads";
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        const result = await cloudinary_1.default.uploader.upload(base64Image, {
            folder: restaurantFolder,
            resource_type: "image",
            transformation: [
                { width: 1000, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" },
            ],
        });
        logger_1.default.info(`Image uploadée avec succès`, { userId: req.user?.id, publicId: result.public_id, folder: restaurantFolder });
        res.status(201).json({
            message: "Image mise en ligne avec succès",
            imageUrl: result.secure_url,
            publicId: result.public_id,
        });
    }
    catch (error) {
        logger_1.default.error(`Erreur lors de l'upload de l'image`, { userId: req.user?.id, error: error.message, stack: error.stack });
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de l'image" });
    }
};
exports.uploadImage = uploadImage;
