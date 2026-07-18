-- Supplier new fields: services table, capability tags, certifications, documents, ITAR
-- Data-safe migration: backfill supplier_services.service_id from old service_type enum

-- 1) New tables / columns
CREATE TABLE `services` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `services_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `capability_tags` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `capability_tags_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `supplier_capability_tags` (
    `id` CHAR(36) NOT NULL,
    `supplier_id` CHAR(36) NOT NULL,
    `tag_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `supplier_capability_tags_supplier_id_tag_id_key`(`supplier_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `supplier_certifications` (
    `id` CHAR(36) NOT NULL,
    `supplier_id` CHAR(36) NOT NULL,
    `type` ENUM('AS9100', 'ISO9001') NOT NULL,
    `certified` BOOLEAN NOT NULL DEFAULT false,
    `expiry_date` DATETIME(3) NULL,
    `file_name` VARCHAR(255) NULL,
    `file_key` VARCHAR(500) NULL,
    `mime_type` VARCHAR(120) NULL,
    `file_size` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `supplier_certifications_supplier_id_type_key`(`supplier_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `supplier_documents` (
    `id` CHAR(36) NOT NULL,
    `supplier_id` CHAR(36) NOT NULL,
    `doc_type` ENUM('CAPABILITY_PROFILE', 'BROCHURE') NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_key` VARCHAR(500) NOT NULL,
    `mime_type` VARCHAR(120) NULL,
    `file_size` INTEGER NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `supplier_profiles`
    ADD COLUMN `itar_registered` BOOLEAN NOT NULL DEFAULT false;

-- 2) Seed canonical services (stable IDs for backfill)
INSERT INTO `services` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
    ('a1000000-0000-4000-8000-000000000001', 'Design', NULL, 'ACTIVE', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('a1000000-0000-4000-8000-000000000002', 'Manufacturing', NULL, 'ACTIVE', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('a1000000-0000-4000-8000-000000000003', 'Inspection', NULL, 'ACTIVE', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('a1000000-0000-4000-8000-000000000004', 'Logistics', NULL, 'ACTIVE', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('a1000000-0000-4000-8000-000000000005', 'Packaging', NULL, 'ACTIVE', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('a1000000-0000-4000-8000-000000000006', 'Certification', NULL, 'ACTIVE', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

-- 3) Add nullable service_id, backfill from service_type, then finalize
ALTER TABLE `supplier_services`
    ADD COLUMN `service_id` CHAR(36) NULL;

UPDATE `supplier_services` ss
INNER JOIN `services` s ON (
    (ss.`service_type` = 'DESIGN' AND s.`name` = 'Design')
    OR (ss.`service_type` = 'MANUFACTURING' AND s.`name` = 'Manufacturing')
    OR (ss.`service_type` = 'INSPECTION' AND s.`name` = 'Inspection')
    OR (ss.`service_type` = 'LOGISTICS' AND s.`name` = 'Logistics')
    OR (ss.`service_type` = 'PACKAGING' AND s.`name` = 'Packaging')
    OR (ss.`service_type` = 'CERTIFICATION' AND s.`name` = 'Certification')
)
SET ss.`service_id` = s.`id`;

DELETE FROM `supplier_services` WHERE `service_id` IS NULL;

-- MySQL FK on supplier_id may use the composite unique index; add a standalone index first
CREATE INDEX `supplier_services_supplier_id_idx` ON `supplier_services`(`supplier_id`);

DROP INDEX `supplier_services_supplier_id_service_type_key` ON `supplier_services`;

ALTER TABLE `supplier_services`
    DROP COLUMN `service_type`,
    MODIFY COLUMN `service_id` CHAR(36) NOT NULL;

CREATE UNIQUE INDEX `supplier_services_supplier_id_service_id_key` ON `supplier_services`(`supplier_id`, `service_id`);

-- 4) Foreign keys
ALTER TABLE `supplier_services`
    ADD CONSTRAINT `supplier_services_service_id_fkey`
    FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `supplier_capability_tags`
    ADD CONSTRAINT `supplier_capability_tags_supplier_id_fkey`
    FOREIGN KEY (`supplier_id`) REFERENCES `supplier_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `supplier_capability_tags`
    ADD CONSTRAINT `supplier_capability_tags_tag_id_fkey`
    FOREIGN KEY (`tag_id`) REFERENCES `capability_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `supplier_certifications`
    ADD CONSTRAINT `supplier_certifications_supplier_id_fkey`
    FOREIGN KEY (`supplier_id`) REFERENCES `supplier_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `supplier_documents`
    ADD CONSTRAINT `supplier_documents_supplier_id_fkey`
    FOREIGN KEY (`supplier_id`) REFERENCES `supplier_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
