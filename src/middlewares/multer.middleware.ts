import multer from "multer";
import logger from "../utils/logger";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    logger.info(`Fichier accepté`, { filename: file.originalname, mimetype: file.mimetype });
    cb(null, true);
  } else {
    logger.warn(`Fichier rejeté : type non autorisé`, { filename: file.originalname, mimetype: file.mimetype });
    cb(new Error("Le fichier doit être une image"), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});