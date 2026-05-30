"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("./prisma"));
async function main() {
    const hashedPassword = await bcrypt_1.default.hash("admin123", 10);
    const admin = await prisma_1.default.user.upsert({
        where: {
            email: "admin@qresto.sn",
        },
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@qresto.sn",
            password: hashedPassword,
            role: "SUPER_ADMIN",
        },
    });
    console.log("Super Admin créé :", admin.email);
}
main()
    .catch((error) => {
    console.error(error);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
