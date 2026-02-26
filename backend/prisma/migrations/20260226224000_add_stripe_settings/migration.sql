-- AlterTable
ALTER TABLE `settings` 
ADD COLUMN `stripePublicKey` VARCHAR(191) NULL,
ADD COLUMN `stripeSecretKey` VARCHAR(191) NULL,
ADD COLUMN `stripeWebhookSecret` VARCHAR(191) NULL;
