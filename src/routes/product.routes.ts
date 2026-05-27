import { Router } from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
} from "../controllers/product.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema";

const router = Router();

router.get("/", protect, getProducts);

router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_ADMIN"),
  validate(createProductSchema),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_ADMIN"),
  validate(updateProductSchema),
  updateProduct
);

router.patch(
  "/:id/availability",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_ADMIN", "EMPLOYEE"),
  toggleProductAvailability
);

router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_ADMIN"),
  deleteProduct
);

export default router;