import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller";
import { protect } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware"; // Importation corrigée

const router = Router();

/**
 * Route d'upload d'image
 * Le champ dans le FormData du frontend doit s'appeler "image"
 */
router.post(
  "/",
  protect, // Seuls les utilisateurs connectés peuvent uploader
  upload.single("image"), // <-- C'est ici que ça plantait
  uploadImage
);

export default router;