-- Script para criar a tabela de configurações
-- Execute este script diretamente no MySQL se necessário
CREATE TABLE
  IF NOT EXISTS `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siteName` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME (3) NOT NULL,
    PRIMARY KEY (`id`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Inserir configurações padrão se a tabela estiver vazia
INSERT INTO
  `settings` (
    `siteName`,
    `logo`,
    `address`,
    `phone`,
    `whatsapp`,
    `email`
  )
SELECT
  'ONG Amigo dos Amigos',
  '',
  '',
  '',
  '',
  ''
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      `settings`
    LIMIT
      1
  );