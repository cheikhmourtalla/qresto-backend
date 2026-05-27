import { Router } from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

// Lister les catégories (Admin + Employee)
router.get(
  "/",
  protect,
  authorize("RESTAURANT_ADMIN", "EMPLOYEE", "SUPER_ADMIN"),
  getCategories
);

// Créer une catégorie (Admin uniquement)
router.post(
  "/",
  protect,
  authorize("RESTAURANT_ADMIN", "SUPER_ADMIN"),
  createCategory
);

// Modifier une catégorie
router.put(
  "/:id",
  protect,
  authorize("RESTAURANT_ADMIN", "SUPER_ADMIN"),
  updateCategory
);

// Supprimer une catégorie
router.delete(
  "/:id",
  protect,
  authorize("RESTAURANT_ADMIN", "SUPER_ADMIN"),
  deleteCategory
);

export default router;