-- Bihar Election 2025 Prediction Calculator - Database Schema

-- Create database (optional - you may already have this)
CREATE DATABASE IF NOT EXISTS numenor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE numenor;

-- Predictions table
CREATE TABLE IF NOT EXISTS bihar_election_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nda_transfer DECIMAL(5,2) NOT NULL,
    mgb_transfer DECIMAL(5,2) NOT NULL,
    others_transfer DECIMAL(5,2) NOT NULL,
    nda_result DECIMAL(5,2) NOT NULL,
    mgb_result DECIMAL(5,2) NOT NULL,
    others_result DECIMAL(5,2) NOT NULL,
    jsp_result DECIMAL(5,2) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_address (ip_address),
    INDEX idx_created_at (created_at),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create a view for easy querying
CREATE OR REPLACE VIEW prediction_summary AS
SELECT 
    id,
    name,
    nda_transfer,
    mgb_transfer,
    others_transfer,
    nda_result,
    mgb_result,
    others_result,
    jsp_result,
    ip_address,
    created_at
FROM bihar_election_predictions
ORDER BY created_at DESC;

