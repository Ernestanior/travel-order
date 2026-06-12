-- Add passport_expiry_date column to passenger_data table
ALTER TABLE passenger_data 
ADD COLUMN passport_expiry_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN passenger_data.passport_expiry_date IS 'Passport expiration/expiry date';
