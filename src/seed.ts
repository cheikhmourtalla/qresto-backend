import bcrypt from "bcrypt";
import prisma from "./prisma";

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
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
    await prisma.$disconnect();
  });