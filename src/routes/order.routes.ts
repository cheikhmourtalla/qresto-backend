import { Router } from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = Router();

// ── Routes publiques (client sans connexion) ──
router.post("/", createOrder);

// ── Routes protégées (dashboard gérant) ──
router.get(
  "/",
  protect,
  authorize("RESTAURANT_ADMIN", "EMPLOYEE", "SUPER_ADMIN"),
  getOrders
);

router.patch(
  "/:id/status",
  protect,
  authorize("RESTAURANT_ADMIN", "EMPLOYEE", "SUPER_ADMIN"),
  updateOrderStatus
);

router.delete(
  "/:id",
  protect,
  authorize("RESTAURANT_ADMIN", "SUPER_ADMIN"),
  deleteOrder
);

export default router;