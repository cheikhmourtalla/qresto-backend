import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Le nom est trop court"),
    description: z.string().optional(),
    price: z.preprocess((val) => Number(val), z.number().positive()),
    categoryId: z.preprocess((val) => Number(val), z.number().int()),
    image: z.string().optional().or(z.literal("")),
    available: z.boolean().optional(),
    restaurantId: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.preprocess((val) => (val ? Number(val) : undefined), z.number().positive().optional()),
    categoryId: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().optional()),
    image: z.string().optional(),
    available: z.boolean().optional(),
  }),
});