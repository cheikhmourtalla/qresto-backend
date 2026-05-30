"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Le nom est trop court"),
        description: zod_1.z.string().optional(),
        price: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().positive()),
        categoryId: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int()),
        image: zod_1.z.string().optional().or(zod_1.z.literal("")),
        available: zod_1.z.boolean().optional(),
        restaurantId: zod_1.z.preprocess((val) => (val ? Number(val) : undefined), zod_1.z.number().optional()),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional(),
        price: zod_1.z.preprocess((val) => (val ? Number(val) : undefined), zod_1.z.number().positive().optional()),
        categoryId: zod_1.z.preprocess((val) => (val ? Number(val) : undefined), zod_1.z.number().int().optional()),
        image: zod_1.z.string().optional(),
        available: zod_1.z.boolean().optional(),
    }),
});
