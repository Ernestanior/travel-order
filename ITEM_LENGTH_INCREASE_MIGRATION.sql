-- Migration: Increase item field length from VARCHAR(50) to VARCHAR(200)
-- This fixes the issue where long item names cause update/insert failures
-- Date: 2026-07-02

-- Update item_data table (for booking orders)
ALTER TABLE item_data 
ALTER COLUMN item TYPE VARCHAR(200);

-- Update exchange_item_data table (for exchange orders)
ALTER TABLE exchange_item_data 
ALTER COLUMN item TYPE VARCHAR(200);

-- Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type, 
    character_maximum_length 
FROM information_schema.columns 
WHERE table_name IN ('item_data', 'exchange_item_data') 
AND column_name = 'item';
