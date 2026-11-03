-- ============================================================================
-- Seed Data for EV Charging Station Availability System
-- Database: ev_charging_db
-- Default password for all users: admin123
-- ============================================================================

USE `ev_charging_db`;

-- 1. Insert Demo Users (1 Admin, 2 Operators, 4 EV Drivers)
INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `phone`, `role`) VALUES
(1, 'Alex Vance', 'admin@evcharge.com', 'admin123', '+91 9876543210', 'ADMIN'),
(2, 'Maya Lin', 'operator1@evcharge.com', 'admin123', '+91 9876543211', 'OPERATOR'),
(3, 'David Chen', 'operator2@evcharge.com', 'admin123', '+91 9876543212', 'OPERATOR'),
(4, 'Elena Rostova', 'elena@example.com', 'admin123', '+91 9876543213', 'USER'),
(5, 'Marcus Brody', 'marcus@example.com', 'admin123', '+91 9876543214', 'USER'),
(6, 'Priya Sharma', 'priya@example.com', 'admin123', '+91 9876543215', 'USER'),
(7, 'Samuel Taylor', 'samuel@example.com', 'admin123', '+91 9876543216', 'USER')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. Insert 8 Charging Stations
INSERT INTO `stations` (`station_id`, `station_name`, `address`, `city`, `latitude`, `longitude`, `opening_time`, `closing_time`, `operator_id`, `status`) VALUES
(1, 'Green Hub FastCharge', 'Anna Salai, Guindy', 'Chennai', 13.006700, 80.248900, '06:00', '23:00', 2, 'ACTIVE'),
(2, 'Metro SuperStation', 'MG Road, Brigade Gateway', 'Bangalore', 12.971600, 77.594600, '00:00', '23:59', 2, 'ACTIVE'),
(3, 'Eco Charge Point', 'Banjara Hills, Road No. 12', 'Hyderabad', 17.385000, 78.486700, '06:00', '23:00', 2, 'ACTIVE'),
(4, 'Central Charge Hub', 'Connaught Place, Block A', 'Delhi', 28.632800, 77.219700, '00:00', '23:59', 3, 'ACTIVE'),
(5, 'Smart EV Station', 'Koregaon Park, Lane 5', 'Pune', 18.536900, 73.893700, '06:00', '22:00', 3, 'ACTIVE'),
(6, 'Quick Charge Depot', 'Salt Lake, Sector V', 'Kolkata', 22.572600, 88.363900, '06:00', '22:30', 2, 'ACTIVE'),
(7, 'Highway EV Plaza', 'Marine Drive, Nariman Point', 'Mumbai', 18.944100, 72.823600, '06:00', '23:00', 3, 'ACTIVE'),
(8, 'Tech Park Charger', 'Electronic City Phase 1', 'Bangalore', 12.844700, 77.663100, '05:00', '23:00', 3, 'ACTIVE')
ON DUPLICATE KEY UPDATE `station_name`=VALUES(`station_name`);

-- 3. Insert 34 Charger Bays
INSERT INTO `chargers` (`charger_id`, `station_id`, `connector_type`, `power_kw`, `price_per_kwh`, `status`) VALUES
-- Station 1: Chennai (6 chargers)
(1, 1, 'CCS2', 150.00, 12.50, 'AVAILABLE'),
(2, 1, 'CCS2', 350.00, 15.00, 'OCCUPIED'),
(3, 1, 'Type 2', 22.00, 8.00, 'AVAILABLE'),
(4, 1, 'Tesla Supercharger', 250.00, 14.00, 'AVAILABLE'),
(5, 1, 'CHAdeMO', 50.00, 10.00, 'AVAILABLE'),
(6, 1, 'CCS2', 150.00, 12.50, 'MAINTENANCE'),

-- Station 2: Bangalore MG Road (5 chargers)
(7, 2, 'CCS2', 350.00, 14.50, 'AVAILABLE'),
(8, 2, 'CCS2', 350.00, 14.50, 'OCCUPIED'),
(9, 2, 'Tesla Supercharger', 250.00, 13.50, 'AVAILABLE'),
(10, 2, 'Type 2', 22.00, 7.50, 'AVAILABLE'),
(11, 2, 'GB/T', 60.00, 9.50, 'AVAILABLE'),

-- Station 3: Hyderabad (4 chargers)
(12, 3, 'CCS2', 150.00, 11.00, 'AVAILABLE'),
(13, 3, 'CCS2', 150.00, 11.00, 'OCCUPIED'),
(14, 3, 'Type 2', 43.00, 9.00, 'AVAILABLE'),
(15, 3, 'CHAdeMO', 50.00, 10.00, 'MAINTENANCE'),

-- Station 4: Delhi (5 chargers)
(16, 4, 'CCS2', 350.00, 16.00, 'AVAILABLE'),
(17, 4, 'CCS2', 150.00, 13.00, 'AVAILABLE'),
(18, 4, 'Tesla Supercharger', 250.00, 14.00, 'OCCUPIED'),
(19, 4, 'Type 2', 22.00, 8.50, 'AVAILABLE'),
(20, 4, 'CHAdeMO', 62.50, 10.50, 'AVAILABLE'),

-- Station 5: Pune (4 chargers)
(21, 5, 'CCS2', 175.00, 11.50, 'AVAILABLE'),
(22, 5, 'CCS2', 175.00, 11.50, 'AVAILABLE'),
(23, 5, 'Tesla Supercharger', 250.00, 12.50, 'AVAILABLE'),
(24, 5, 'Type 2', 22.00, 7.00, 'OCCUPIED'),

-- Station 6: Kolkata (3 chargers)
(25, 6, 'CCS2', 120.00, 10.50, 'AVAILABLE'),
(26, 6, 'Type 2', 22.00, 7.50, 'AVAILABLE'),
(27, 6, 'CHAdeMO', 50.00, 9.50, 'AVAILABLE'),

-- Station 7: Mumbai (4 chargers)
(28, 7, 'CCS2', 200.00, 13.00, 'AVAILABLE'),
(29, 7, 'CCS2', 150.00, 12.00, 'AVAILABLE'),
(30, 7, 'Type 2', 22.00, 8.50, 'AVAILABLE'),
(31, 7, 'Tesla Supercharger', 250.00, 13.50, 'OCCUPIED'),

-- Station 8: Bangalore EC (3 chargers)
(32, 8, 'CCS2', 150.00, 11.50, 'AVAILABLE'),
(33, 8, 'Type 2', 22.00, 7.50, 'AVAILABLE'),
(34, 8, 'Tesla Supercharger', 250.00, 13.00, 'AVAILABLE')
ON DUPLICATE KEY UPDATE `power_kw`=VALUES(`power_kw`);

-- 4. Insert Sample Bookings
INSERT INTO `bookings` (`booking_id`, `user_id`, `charger_id`, `start_time`, `end_time`, `booking_status`, `notes`) VALUES
(1, 4, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR), 'COMPLETED', 'Regular weekly commuter charge'),
(2, 5, 7, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 22 HOUR), 'COMPLETED', 'Highway trip top-up'),
(3, 6, 12, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 47 HOUR), 'COMPLETED', 'Quick charge during shopping'),
(4, 4, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 1 HOUR), 'CONFIRMED', 'Morning work commute reserve'),
(5, 5, 4, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 'CONFIRMED', 'Tesla Model Y high-speed slot'),
(6, 6, 11, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 90 MINUTE), 'CONFIRMED', 'Afternoon charge slot'),
(7, 7, 2, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 1 HOUR), 'CONFIRMED', 'Downtown fast charge')
ON DUPLICATE KEY UPDATE `booking_status`=VALUES(`booking_status`);

-- 5. Insert Charging Sessions for Completed Bookings
INSERT INTO `charging_sessions` (`session_id`, `booking_id`, `energy_used`, `start_time`, `end_time`, `total_cost`) VALUES
(1, 1, 48.50, DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 23 HOUR), 606.25),
(2, 2, 62.00, DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 22 HOUR), 899.00),
(3, 3, 38.20, DATE_SUB(NOW(), INTERVAL 48 HOUR), DATE_SUB(NOW(), INTERVAL 47 HOUR), 420.20)
ON DUPLICATE KEY UPDATE `energy_used`=VALUES(`energy_used`);
