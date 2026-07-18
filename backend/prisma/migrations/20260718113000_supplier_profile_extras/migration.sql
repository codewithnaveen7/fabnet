-- Add trade license, country of registration, website URL, and comments to supplier profiles
ALTER TABLE `supplier_profiles`
  ADD COLUMN `trade_license_number` VARCHAR(255) NULL,
  ADD COLUMN `country_of_registration` VARCHAR(120) NULL,
  ADD COLUMN `website_url` VARCHAR(500) NULL,
  ADD COLUMN `comments` TEXT NULL;
