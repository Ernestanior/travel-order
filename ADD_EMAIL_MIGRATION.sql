-- Add email column to customer data table
ALTER TABLE "customer data" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);

-- Update the primary key to include email if needed (optional, depends on your requirements)
-- For now, we'll just add the column without changing the primary key

COMMENT ON COLUMN "customer data"."email" IS 'Email address of customer';
