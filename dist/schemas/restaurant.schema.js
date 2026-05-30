"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRestaurantSchema = exports.createRestaurantSchema = void 0;
const zod_1 = require("zod");
exports.createRestaurantSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Nom trop court"),
        slug: zod_1.z.string().min(2, "Slug requis"),
        phone: zod_1.z.string().min(8, "Téléphone requis"),
        address: zod_1.z.string().optional(),
        adminName: zod_1.z.string().min(2, "Nom admin requis"),
        adminEmail: zod_1.z.string().email("Email invalide"),
        adminPassword: zod_1.z.string().min(6, "Mot de passe trop court"),
    }),
});
exports.deleteRestaurantSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
    }),
});
