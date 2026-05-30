-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('SUPER_ADMIN', 'RESTAURANT_ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "public"."order_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'SERVED');

-- CreateTable
CREATE TABLE "public"."restaurant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "banner" TEXT,
    "subscription" TEXT DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."user_role" NOT NULL DEFAULT 'RESTAURANT_ADMIN',
    "restaurantId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" INTEGER NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order" (
    "id" SERIAL NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "status" "public"."order_status" NOT NULL DEFAULT 'PENDING',
    "billRequested" BOOLEAN NOT NULL DEFAULT false,
    "restaurantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_item" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WaiterCall" (
    "id" SERIAL NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "handledAt" TIMESTAMP(3),
    "restaurantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaiterCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "public"."restaurant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "User_restaurantId_fkey" ON "public"."user"("restaurantId");

-- CreateIndex
CREATE INDEX "Category_restaurantId_fkey" ON "public"."category"("restaurantId");

-- CreateIndex
CREATE INDEX "Product_categoryId_fkey" ON "public"."product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_restaurantId_fkey" ON "public"."product"("restaurantId");

-- CreateIndex
CREATE INDEX "order_restaurantId_idx" ON "public"."order"("restaurantId");

-- CreateIndex
CREATE INDEX "order_item_orderId_idx" ON "public"."order_item"("orderId");

-- CreateIndex
CREATE INDEX "order_item_productId_idx" ON "public"."order_item"("productId");

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."category" ADD CONSTRAINT "category_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product" ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product" ADD CONSTRAINT "product_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order" ADD CONSTRAINT "order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_item" ADD CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_item" ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
