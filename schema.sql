CREATE DATABASE IF NOT EXISTS `lead_manager`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `lead_manager`;

CREATE TABLE IF NOT EXISTS `leads` (
  `id`         INT           NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100)  NOT NULL,
  `email`      VARCHAR(150)  NOT NULL,
  `phone`      VARCHAR(20)   NOT NULL,
  `company`    VARCHAR(100)  NOT NULL,
  `source`     VARCHAR(50)   NOT NULL,
  `status`     ENUM('New', 'Contacted', 'Qualified', 'Lost') NOT NULL DEFAULT 'New',
  `created_at` TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leads_status` (`status`),
  KEY `idx_leads_source` (`source`),
  KEY `idx_leads_name` (`name`),
  KEY `idx_leads_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
