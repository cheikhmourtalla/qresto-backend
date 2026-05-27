/*
  Warnings:

  - You are about to drop the column `billRequested` on the `order` table. All the data in the column will be lost.
  - The values [BILL_REQUESTED] on the enum `order_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `billRequested`,
    ADD COLUMN `tableId` INTEGER NULL,
    MODIFY `status` ENUM('PENDING', 'IN_PROGRESS', 'SERVED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `table` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `restaurantId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `table_token_key`(`token`),
    INDEX `table_restaurantId_idx`(`restaurantId`),
    UNIQUE INDEX `table_number_restaurantId_key`(`number`, `restaurantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `order_tableId_idx` ON `order`(`tableId`);

-- AddForeignKey
ALTER TABLE `table` ADD CONSTRAINT `table_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_tableId_fkey` FOREIGN KEY (`tableId`) REFERENCES `table`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
