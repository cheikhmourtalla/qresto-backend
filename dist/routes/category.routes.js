"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Lister les catégories (Admin + Employee)
router.get("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("RESTAURANT_ADMIN", "EMPLOYEE", "SUPER_ADMIN"), category_controller_1.getCategories);
// Créer une catégorie (Admin uniquement)
router.post("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("RESTAURANT_ADMIN", "SUPER_ADMIN"), category_controller_1.createCategory);
// Modifier une catégorie
router.put("/:id", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("RESTAURANT_ADMIN", "SUPER_ADMIN"), category_controller_1.updateCategory);
// Supprimer une catégorie
router.delete("/:id", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("RESTAURANT_ADMIN", "SUPER_ADMIN"), category_controller_1.deleteCategory);
exports.default = router;
