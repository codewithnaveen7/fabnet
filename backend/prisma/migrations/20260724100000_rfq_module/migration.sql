-- CreateTable
CREATE TABLE `rfqs` (
    `id` CHAR(36) NOT NULL,
    `rfq_number` VARCHAR(32) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `requested_by_id` CHAR(36) NOT NULL,
    `client_project_name` VARCHAR(255) NOT NULL,
    `date_created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `quote_due_date` DATE NOT NULL,
    `required_delivery_date` DATE NOT NULL,
    `part_name` VARCHAR(255) NOT NULL,
    `part_number` VARCHAR(255) NOT NULL,
    `revision_level` VARCHAR(50) NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `unit_of_measure` VARCHAR(32) NOT NULL,
    `special_processes` JSON NOT NULL,
    `tolerance_notes` TEXT NULL,
    `required_certifications` JSON NOT NULL,
    `itar_export_control` BOOLEAN NOT NULL,
    `country_of_origin_restriction` VARCHAR(120) NULL,
    `incoterms` VARCHAR(32) NOT NULL,
    `target_budgetary_price` DECIMAL(14, 2) NULL,
    `payment_terms` VARCHAR(64) NULL,
    `currency` VARCHAR(8) NOT NULL,
    `quotes_required` INTEGER NULL,
    `status` ENUM('DRAFT', 'SENT', 'QUOTES_RECEIVED', 'AWARDED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rfqs_rfq_number_key`(`rfq_number`),
    INDEX `rfqs_status_idx`(`status`),
    INDEX `rfqs_quote_due_date_idx`(`quote_due_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_process_tags` (
    `id` CHAR(36) NOT NULL,
    `rfq_id` CHAR(36) NOT NULL,
    `tag_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `rfq_process_tags_rfq_id_tag_id_key`(`rfq_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_material_tags` (
    `id` CHAR(36) NOT NULL,
    `rfq_id` CHAR(36) NOT NULL,
    `tag_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `rfq_material_tags_rfq_id_tag_id_key`(`rfq_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_documents` (
    `id` CHAR(36) NOT NULL,
    `rfq_id` CHAR(36) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_key` VARCHAR(500) NOT NULL,
    `mime_type` VARCHAR(120) NULL,
    `file_size` INTEGER NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_invites` (
    `id` CHAR(36) NOT NULL,
    `rfq_id` CHAR(36) NOT NULL,
    `supplier_id` CHAR(36) NOT NULL,
    `included` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `rfq_invites_rfq_id_supplier_id_key`(`rfq_id`, `supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rfqs` ADD CONSTRAINT `rfqs_requested_by_id_fkey` FOREIGN KEY (`requested_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_process_tags` ADD CONSTRAINT `rfq_process_tags_rfq_id_fkey` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_process_tags` ADD CONSTRAINT `rfq_process_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `capability_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_material_tags` ADD CONSTRAINT `rfq_material_tags_rfq_id_fkey` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_material_tags` ADD CONSTRAINT `rfq_material_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `capability_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_documents` ADD CONSTRAINT `rfq_documents_rfq_id_fkey` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_invites` ADD CONSTRAINT `rfq_invites_rfq_id_fkey` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_invites` ADD CONSTRAINT `rfq_invites_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
