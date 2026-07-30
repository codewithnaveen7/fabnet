-- CreateTable
CREATE TABLE `rfq_quotes` (
    `id` CHAR(36) NOT NULL,
    `rfq_id` CHAR(36) NOT NULL,
    `supplier_id` CHAR(36) NOT NULL,
    `service_id` CHAR(36) NOT NULL,
    `price` DECIMAL(14, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rfq_quotes_rfq_id_supplier_id_service_id_key`(`rfq_id`, `supplier_id`, `service_id`),
    INDEX `rfq_quotes_rfq_id_service_id_idx`(`rfq_id`, `service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_awards` (
    `id` CHAR(36) NOT NULL,
    `rfq_id` CHAR(36) NOT NULL,
    `service_id` CHAR(36) NOT NULL,
    `supplier_id` CHAR(36) NOT NULL,
    `awarded_by_id` CHAR(36) NOT NULL,
    `awarded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `rfq_awards_rfq_id_service_id_key`(`rfq_id`, `service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rfq_quotes` ADD CONSTRAINT `rfq_quotes_rfq_id_fkey` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_quotes` ADD CONSTRAINT `rfq_quotes_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_quotes` ADD CONSTRAINT `rfq_quotes_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_awards` ADD CONSTRAINT `rfq_awards_rfq_id_fkey` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_awards` ADD CONSTRAINT `rfq_awards_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_awards` ADD CONSTRAINT `rfq_awards_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_awards` ADD CONSTRAINT `rfq_awards_awarded_by_id_fkey` FOREIGN KEY (`awarded_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
