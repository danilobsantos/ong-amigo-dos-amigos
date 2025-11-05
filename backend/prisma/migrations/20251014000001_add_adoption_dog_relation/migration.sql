-- AddForeignKey
ALTER TABLE `adoptions` ADD CONSTRAINT `adoptions_dogId_fkey` FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;