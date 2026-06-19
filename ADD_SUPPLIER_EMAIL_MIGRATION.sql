-- Add email column to supplier data table
ALTER TABLE "supplier_data" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);

COMMENT ON COLUMN "supplier_data"."email" IS 'Email address of supplier';
