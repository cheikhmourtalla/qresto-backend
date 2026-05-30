"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const restaurant_controller_1 = require("../controllers/restaurant.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const restaurant_schema_1 = require("../schemas/restaurant.schema");
const router = (0, express_1.Router)();
// Routes Statiques (Prioritaires pour éviter les conflits avec /:id)
router.get("/me", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("RESTAURANT_ADMIN", "EMPLOYEE"), restaurant_controller_1.getMyRestaurant);
router.put("/me", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("RESTAURANT_ADMIN"), restaurant_controller_1.updateMyRestaurant);
// Routes Super Admin
router.post("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("SUPER_ADMIN"), (0, validate_middleware_1.validate)(restaurant_schema_1.createRestaurantSchema), restaurant_controller_1.createRestaurant);
router.get("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("SUPER_ADMIN"), restaurant_controller_1.getRestaurants);
// Route de mise à jour partielle (Utilisée par la modale de modification)
router.patch("/:id", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("SUPER_ADMIN"), restaurant_controller_1.updateRestaurant);
router.delete("/:id", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("SUPER_ADMIN"), (0, validate_middleware_1.validate)(restaurant_schema_1.deleteRestaurantSchema), restaurant_controller_1.deleteRestaurant);
exports.default = router;
