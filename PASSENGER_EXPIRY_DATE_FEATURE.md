# Passenger Passport Expiry Date Feature ✅

## Summary
Added "Passport Expiry Date" field to Passengers section in Booking Orders (both new and edit modes).

## Changes Made

### 1. Database Schema Update

#### File: `prisma/schema.prisma`
Added `passport_expiry_date` column to `PassengerData` model:

```prisma
model PassengerData {
  bookno               String       @db.VarChar(50)
  paxname              String       @db.VarChar(50)
  passport             String?      @db.VarChar(50)
  birthdate            DateTime?    @db.Date
  passport_expiry_date DateTime?    @db.Date  // ✅ New field
  exchangeno           String?      @db.VarChar(50)
  booking              BookingData? @relation(fields: [bookno], references: [bookno])

  @@id([bookno, paxname])
  @@map("passenger_data")
}
```

#### SQL Migration Script
Created `/ADD_PASSPORT_EXPIRY_MIGRATION.sql`:

```sql
-- Add passport_expiry_date column to passenger_data table
ALTER TABLE passenger_data 
ADD COLUMN passport_expiry_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN passenger_data.passport_expiry_date IS 'Passport expiration/expiry date';
```

**Action Required**: Run this SQL migration on the database.

### 2. TypeScript Interfaces

#### Updated `Passenger` interface in:
- `/app/booking-orders/[id]/page.tsx`
- `/app/booking-orders/new/page.tsx`

```typescript
interface Passenger {
  name: string
  passport: string
  birthdate: string
  passportExpiryDate: string  // ✅ Added
}
```

### 3. API Changes

#### GET /api/booking-orders/[id]
Updated passenger mapping to include `passportExpiryDate`:

```typescript
passengers: booking.passengers.map(p => ({
  name: p.paxname,
  passport: p.passport || '',
  birthdate: p.birthdate?.toISOString().split('T')[0] || '',
  passportExpiryDate: p.passport_expiry_date?.toISOString().split('T')[0] || ''  // ✅ Added
}))
```

#### PUT /api/booking-orders/[id]
Updated passenger creation to save `passport_expiry_date`:

```typescript
await prisma.passengerData.createMany({
  data: body.passengers.map((p: any) => ({
    bookno: existingBooking.bookno,
    paxname: p.name,
    passport: p.passport || null,
    birthdate: p.birthdate ? new Date(p.birthdate) : null,
    passport_expiry_date: p.passportExpiryDate ? new Date(p.passportExpiryDate) : null  // ✅ Added
  }))
})
```

#### POST /api/booking-orders/create
Updated passenger creation to save `passport_expiry_date`:

```typescript
await prisma.passengerData.createMany({
  data: body.passengers.map((p: any) => ({
    bookno: newBookingNumber,
    paxname: p.name,
    passport: p.passport || null,
    birthdate: p.birthdate ? new Date(p.birthdate) : null,
    passport_expiry_date: p.passportExpiryDate ? new Date(p.passportExpiryDate) : null  // ✅ Added
  }))
})
```

### 4. Frontend UI Changes

#### New Booking Page (`/app/booking-orders/new/page.tsx`)

**Grid Layout Update**:
Changed from `5-3-3-1` to `4-2-2-3-1` columns:

```typescript
// Old layout
<div className="col-span-5">Name</div>
<div className="col-span-3">Passport</div>
<div className="col-span-3">Birth Date</div>
<div className="col-span-1">Delete</div>

// New layout
<div className="col-span-4">Name</div>
<div className="col-span-2">Passport</div>
<div className="col-span-2">Birth Date</div>
<div className="col-span-3">Passport Expiry Date</div>  // ✅ New
<div className="col-span-1">Delete</div>
```

**Field Details**:
```jsx
<div className="col-span-3">
  <label className="block text-xs font-medium text-gray-600 mb-1">
    Passport Expiry Date
  </label>
  <input
    type="date"
    value={passenger.passportExpiryDate}
    onChange={(e) => updatePassenger(index, 'passportExpiryDate', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
  />
</div>
```

**Add Passenger Function**:
```typescript
const addPassenger = () => {
  setPassengers([...passengers, { 
    name: '', 
    passport: '', 
    birthdate: '', 
    passportExpiryDate: ''  // ✅ Added
  }])
}
```

#### Edit Booking Page (`/app/booking-orders/[id]/page.tsx`)

**Edit Mode Grid Layout**:
Same as new page - changed from `5-3-3-1` to `4-2-2-3-1` columns with passport expiry date field.

**View Mode Display**:
```typescript
{(passenger.passport || passenger.birthdate || passenger.passportExpiryDate) && (
  <p className="text-xs text-gray-500 mt-1">
    {passenger.passport && `Passport: ${passenger.passport}`}
    {passenger.passport && (passenger.birthdate || passenger.passportExpiryDate) && ' • '}
    {passenger.birthdate && `DOB: ${passenger.birthdate}`}
    {passenger.birthdate && passenger.passportExpiryDate && ' • '}
    {passenger.passportExpiryDate && `Expiry: ${passenger.passportExpiryDate}`}  // ✅ Added
  </p>
)}
```

## UI Layout

### Edit/New Mode
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Passengers                                                    [+ Add]     │
├──────────────────────────────────────────────────────────────────────────┤
│ Name              | Passport | Birth Date  | Passport Expiry Date | [X] │
│ [CHAI YI LONG...] | [K5837.] | [dd/mm/yyyy]| [dd/mm/yyyy]         | [🗑️] │
└──────────────────────────────────────────────────────────────────────────┘
```

### View Mode
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Passengers                                                                │
├──────────────────────────────────────────────────────────────────────────┤
│ CHAI YI LONG JASON (DOE:09/X)                                           │
│ Passport: K5837286Z • DOB: 1990-01-01 • Expiry: 2030-12-31             │
└──────────────────────────────────────────────────────────────────────────┘
```

## Column Width Distribution

### 12-Column Grid Breakdown:
- **Name**: 4 columns (33%)
- **Passport**: 2 columns (17%)
- **Birth Date**: 2 columns (17%)
- **Passport Expiry Date**: 3 columns (25%)
- **Delete Button**: 1 column (8%)

Total: 12 columns = 100%

## Field Specifications

| Field Name            | Type | Required | Format     | Description                    |
|-----------------------|------|----------|------------|--------------------------------|
| Name                  | Text | Yes      | Free text  | Passenger full name            |
| Passport              | Text | No       | Free text  | Passport number                |
| Birth Date            | Date | No       | YYYY-MM-DD | Date of birth                  |
| Passport Expiry Date  | Date | No       | YYYY-MM-DD | Passport expiration date (NEW) |

## Database Migration Steps

1. **Backup Database** (recommended)
   ```bash
   pg_dump your_database > backup.sql
   ```

2. **Run Migration**
   ```bash
   psql your_database < ADD_PASSPORT_EXPIRY_MIGRATION.sql
   ```

3. **Update Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Verify Migration**
   ```sql
   \d passenger_data
   -- Should show passport_expiry_date column
   ```

## Testing Checklist

### Test 1: Create New Booking with Passport Expiry
1. Go to "New Booking Order" page
2. Add a passenger
3. Fill in all fields including "Passport Expiry Date"
4. Save booking
5. ✅ Verify expiry date is saved

### Test 2: Edit Existing Booking
1. Open an existing booking
2. Click "Edit"
3. Add/update passenger passport expiry date
4. Click "Save"
5. Refresh page
6. ✅ Verify expiry date persists

### Test 3: View Mode Display
1. Open booking with passenger that has expiry date
2. View mode should show: "Passport: XXX • DOB: YYYY-MM-DD • Expiry: YYYY-MM-DD"
3. ✅ Verify format is correct

### Test 4: Optional Field
1. Create passenger without expiry date
2. ✅ Should save successfully (field is optional)
3. View should not show "Expiry:" if empty

### Test 5: Multiple Passengers
1. Add 3 passengers with different expiry dates
2. Save booking
3. ✅ All expiry dates should be saved correctly

### Test 6: API Response
1. Check GET `/api/booking-orders/[id]` response
2. ✅ Should include `passportExpiryDate` in passengers array

## Files Modified

1. **Database**:
   - `prisma/schema.prisma` - Added passport_expiry_date field
   - `ADD_PASSPORT_EXPIRY_MIGRATION.sql` - Migration script

2. **Frontend**:
   - `/app/booking-orders/new/page.tsx` - Added expiry field to new booking
   - `/app/booking-orders/[id]/page.tsx` - Added expiry field to edit mode

3. **API**:
   - `/app/api/booking-orders/[id]/route.ts` - GET & PUT endpoints
   - `/app/api/booking-orders/create/route.ts` - POST endpoint

## Notes

### Date Format
- **Frontend**: HTML5 date input (YYYY-MM-DD)
- **Database**: PostgreSQL DATE type
- **API**: ISO string format, split to get date part

### Optional Field
Passport Expiry Date is optional because:
- Not all bookings may have passport information
- Domestic flights may not require passport
- Data may be added later

### Backward Compatibility
- Existing passengers without expiry date will show empty string
- No data migration needed for existing records
- Field defaults to NULL in database

---
**Added**: June 11, 2026
**Feature**: Passport Expiry Date for Passengers
**Database**: Requires migration - ADD_PASSPORT_EXPIRY_MIGRATION.sql
**Status**: ⚠️ Migration pending - Run SQL script to apply changes
