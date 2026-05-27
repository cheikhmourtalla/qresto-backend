import { z } from "zod";

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Nom trop court"),
    slug: z.string().min(2, "Slug requis"),
    phone: z.string().min(8, "Téléphone requis"),
    address: z.string().optional(),
    adminName: z.string().min(2, "Nom admin requis"),
    adminEmail: z.string().email("Email invalide"),
    adminPassword: z.string().min(6, "Mot de passe trop court"),
  }),
});

export const deleteRestaurantSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
});
