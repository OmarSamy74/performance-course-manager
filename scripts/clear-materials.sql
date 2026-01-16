-- SQL script to clear all materials from PostgreSQL database
-- Run this in your PostgreSQL database (Railway, local, etc.)

-- Delete all materials
DELETE FROM materials;

-- Verify deletion
SELECT COUNT(*) as remaining_materials FROM materials;

-- Optional: Reset the sequence if you want to start IDs from 1
-- (Not needed for UUID, but included for reference)
