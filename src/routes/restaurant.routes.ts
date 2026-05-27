import { Router } from "express";
import {
  createRestaurant,
  getRestaurants,
  updateRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  deleteRestaurant,
} from "../controllers/restaurant.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createRestaurantSchema,
  deleteRestaurantSchema,
} from "../schemas/restaurant.schema";

const router = Router();

// Routes Statiques (Prioritaires pour éviter les conflits avec /:id)
router.get(
  "/me",
  protect,
  authorize("RESTAURANT_ADMIN", "EMPLOYEE"),
  getMyRestaurant
);

router.put(
  "/me",
  protect,
  authorize("RESTAURANT_ADMIN"),
  updateMyRestaurant
);

// Routes Super Admin
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN"),
  validate(createRestaurantSchema),
  createRestaurant
);

router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN"),
  getRestaurants
);

// Route de mise à jour partielle (Utilisée par la modale de modification)
router.patch(
  "/:id",
  protect,
  authorize("SUPER_ADMIN"),
  updateRestaurant
);

router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN"),
  validate(deleteRestaurantSchema),
  deleteRestaurant
);

export default router;