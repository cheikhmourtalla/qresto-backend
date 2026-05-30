"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client"); // ← change cette ligne
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
exports.default = prisma;
