# 🚀 Run Database Migration for Passport Expiry Date

## Quick Start

You need to run the SQL migration to add the `passport_expiry_date` column to your database.

### Option 1: Using psql Command Line

```bash
psql $DATABASE_URL -f ADD_PASSPORT_EXPIRY_MIGRATION.sql
```

### Option 2: Using Database Client

1. Open your PostgreSQL client (pgAdmin, DBeaver, etc.)
2. Connect to your database
3. Run this SQL:

```sql
ALTER TABLE passenger_data 
ADD COLUMN passport_expiry_date DATE;

COMMENT ON COLUMN passenger_data.passport_expiry_date IS 'Passport expiration/expiry date';
```

### Option 3: Using Prisma

```bash
# Generate new Prisma client with updated schema
npx prisma generate

# If you want Prisma to create migration (optional)
npx prisma migrate dev --name add_passport_expiry_date
```

## After Migration

Once the migration is complete:

1. **Restart your Next.js server**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Test the feature**
   - Go to "New Booking Order"
   - Add a passenger
   - You should see the new "Passport Expiry Date" field
   - Fill it in and save
   - Verify it displays correctly

## Verification

Check if the column was added successfully:

```sql
\d passenger_data

-- Or

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'passenger_data' 
  AND column_name = 'passport_expiry_date';
```

Should show:
```
      column_name       | data_type 
------------------------+-----------
 passport_expiry_date   | date
```

## Rollback (if needed)

If you need to remove the column:

```sql
ALTER TABLE passenger_data 
DROP COLUMN passport_expiry_date;
```

---
**Important**: This migration is **safe** and **non-destructive**. It only adds a new optional column. Existing data will not be affected.
