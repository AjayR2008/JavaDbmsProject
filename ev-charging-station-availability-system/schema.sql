-- ============================================================================
-- SQL Schema for EV Charging Station Availability System
-- Target Database: MariaDB 10.4+ / MySQL 8.0+ (XAMPP)
-- Database Name: ev_charging_db
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `ev_charging_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `ev_charging_db`;

-- Drop tables in reverse order of foreign key dependency
DROP TABLE IF EXISTS `charging_sessions`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `chargers`;
DROP TABLE IF EXISTS `stations`;
DROP TABLE IF EXISTS `users`;

-- ----------------------------------------------------------------------------
-- Table 1: users
-- Stores user credentials, contact, and roles (USER / OPERATOR / ADMIN)
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `role` ENUM('USER', 'OPERATOR', 'ADMIN') NOT NULL DEFAULT 'USER',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 2: stations
-- Stores charging stations with operational hours, location, and operator
-- ----------------------------------------------------------------------------
CREATE TABLE `stations` (
  `station_id` INT AUTO_INCREMENT PRIMARY KEY,
  `station_name` VARCHAR(150) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10, 6) NOT NULL,
  `longitude` DECIMAL(10, 6) NOT NULL,
  `opening_time` VARCHAR(10) NOT NULL DEFAULT '06:00',
  `closing_time` VARCHAR(10) NOT NULL DEFAULT '23:00',
  `operator_id` INT NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_stations_city` (`city`),
  INDEX `idx_stations_operator` (`operator_id`),
  CONSTRAINT `fk_stations_operator`
    FOREIGN KEY (`operator_id`) REFERENCES `users` (`user_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 3: chargers
-- Stores individual charger bays, connector type, power rating, and tariff
-- ----------------------------------------------------------------------------
CREATE TABLE `chargers` (
  `charger_id` INT AUTO_INCREMENT PRIMARY KEY,
  `station_id` INT NOT NULL,
  `connector_type` VARCHAR(50) NOT NULL,
  `power_kw` DECIMAL(6, 2) NOT NULL,
  `price_per_kwh` DECIMAL(6, 2) NOT NULL,
  `status` ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_chargers_station` (`station_id`),
  INDEX `idx_chargers_status` (`status`),
  INDEX `idx_chargers_connector` (`connector_type`),
  CONSTRAINT `fk_chargers_station`
    FOREIGN KEY (`station_id`) REFERENCES `stations` (`station_id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 4: bookings
-- Stores slot reservations with overlap-checking index
-- ----------------------------------------------------------------------------
CREATE TABLE `bookings` (
  `booking_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `charger_id` INT NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `booking_status` ENUM('CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'CONFIRMED',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_bookings_user` (`user_id`),
  INDEX `idx_bookings_overlap` (`charger_id`, `booking_status`, `start_time`, `end_time`),
  CONSTRAINT `fk_bookings_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_charger`
    FOREIGN KEY (`charger_id`) REFERENCES `chargers` (`charger_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 5: charging_sessions
-- Records actual energy delivered (kWh) and billing upon session end
-- ----------------------------------------------------------------------------
CREATE TABLE `charging_sessions` (
  `session_id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL UNIQUE,
  `energy_used` DECIMAL(8, 2) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `total_cost` DECIMAL(8, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sessions_booking` (`booking_id`),
  CONSTRAINT `fk_sessions_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
