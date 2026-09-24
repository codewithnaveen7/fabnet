-- AlterTable
ALTER TABLE `rfqs`
  ADD COLUMN `client_email` VARCHAR(255) NULL,
  ADD COLUMN `client_contact_person` VARCHAR(255) NULL,
  ADD COLUMN `client_phone` VARCHAR(50) NULL,
  ADD COLUMN `quotation_sent_at` DATETIME(3) NULL;
