"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_middleware_1 = require("../middlewares/multer.middleware"); // Importation corrigée
const router = (0, express_1.Router)();
/**
 * Route d'upload d'image
 * Le champ dans le FormData du frontend doit s'appeler "image"
 */
router.post("/", auth_middleware_1.protect, // Seuls les utilisateurs connectés peuvent uploader
multer_middleware_1.upload.single("image"), // <-- C'est ici que ça plantait
upload_controller_1.uploadImage);
exports.default = router;
