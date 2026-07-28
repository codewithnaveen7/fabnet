-- AlterTable: RFQ process category now maps to supplier Services
CREATE TABLE `rfq_process_services` (
    `id` CHAR(36) NOT NULL,
    `rfq_id` CHAR(36) NOT NULL,
    `service_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `rfq_process_services_rfq_id_service_id_key`(`rfq_id`, `service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `rfq_process_services` ADD CONSTRAINT `rfq_process_services_rfq_id_fkey` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `rfq_process_services` ADD CONSTRAINT `rfq_process_services_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop legacy capability-tag process links (not mappable 1:1 to services)
DROP TABLE IF EXISTS `rfq_process_tags`;
