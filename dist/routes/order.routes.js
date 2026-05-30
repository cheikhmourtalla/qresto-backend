"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// ── Routes publiques (client sans connexion) ──
router.post("/", order_controller_1.createOrder);
// ── Routes protégées (dashboard gérant) ──
router.get("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("RESTAURANT_ADMIN", "EMPLOYEE", "SUPER_ADMIN"), order_controller_1.getOrders);
router.patch("/:id/status", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("RESTAURANT_ADMIN", "EMPLOYEE", "SUPER_ADMIN"), order_controller_1.updateOrderStatus);
router.delete("/:id", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("RESTAURANT_ADMIN", "SUPER_ADMIN"), order_controller_1.deleteOrder);
exports.default = router;
