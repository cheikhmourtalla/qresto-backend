/*
  Warnings:

  - You are about to drop the column `billStatus` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `order` table. All the data in the column will be lost.
  - The values [COMPLETED,CANCELLED] on the enum `order_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `orderitem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_productId_fkey`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `billStatus`,
    DROP COLUMN `totalPrice`,
    ADD COLUMN `billRequested` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `status` ENUM('PENDING', 'IN_PROGRESS', 'SERVED', 'BILL_REQUESTED') NOT NULL DEFAULT 'PENDING',
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `orderitem`;

-- CreateTable
CREATE TABLE `order_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,

    INDEX `order_item_orderId_idx`(`orderId`),
    INDEX `order_item_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_restaurantId_idx` TO `order_restaurantId_idx`;
