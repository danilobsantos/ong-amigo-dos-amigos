-- CreateTable
CREATE TABLE
  `dog_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `dogId` INTEGER NOT NULL,
    INDEX `DogImage_dogId_fkey` (`dogId`),
    PRIMARY KEY (`id`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dog_images` ADD CONSTRAINT `DogImage_dogId_fkey` FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;