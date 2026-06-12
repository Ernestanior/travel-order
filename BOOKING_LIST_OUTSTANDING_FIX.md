# Booking Orders List Outstanding Calculation Fix ✅

## Problem Identified

In the Booking Orders list page, the Outstanding amount was **not considering discount**.

### Example from Screenshot
**Booking #1043521**:
- Total Cost: $100.00
- Discount: $5.00 (visible in detail page)
- Paid: $50.00
- **Outstanding shown**: $50.00 ❌
- **Outstanding should be**: $45.00 ✅

### Calculation Error
```typescript
// BEFORE (WRONG)
const outstanding = totalCost - paid
// Example: 100 - 50 = 50 ❌

// AFTER (CORRECT)
const outstanding = (totalCost - discount) - paid
// Example: (100 - 5) - 50 = 45 ✅
```

## Root Cause

### File: `/app/api/booking-orders/route.ts`

**Issue 1**: Discount field not selected
```typescript
// BEFORE
select: {
  id: true,
  bookno: true,
  customer: true,
  // ... other fields
  // ❌ discount field missing!
}
```

**Issue 2**: Outstanding calculation ignored discount
```typescript
// BEFORE
const outstanding = totalCost - paid
// ❌ Didn't subtract discount from totalCost
```

## Solution Implemented

### Change 1: Add Discount to Select Query
```typescript
select: {
  id: true,
  bookno: true,
  customer: true,
  bookdate: true,
  deptdate: true,
  arrvdate: true,
  status: true,
  tour: true,
  discount: true,  // ✅ Added
  // ... rest of fields
}
```

### Change 2: Fix Outstanding Calculation
```typescript
const formatted = bookings.map(booking => {
  const totalCost = booking.items.reduce((sum, item) => 
    sum + Number(item.price || 0), 0
  )
  const discount = Number(booking.discount || 0)  // ✅ Added
  const paid = booking.payments.reduce((sum, payment) => 
    sum + Number(payment.amountpaid || 0), 0
  )
  const outstanding = (totalCost - discount) - paid  // ✅ Fixed
  
  return {
    // ... fields
    totalCost,
    paid,
    outstanding,
    // ... other fields
  }
})
```

## Impact

### Before Fix
| Booking # | Total | Discount | Paid | Outstanding (Wrong) |
|-----------|-------|----------|------|---------------------|
| 1043521   | $100  | $5       | $50  | $50 ❌              |
| 1043520   | $299  | $0       | $290 | $9 ✅               |
| 1043518   | $99   | $0       | $90  | $9 ✅               |

### After Fix
| Booking # | Total | Discount | Paid | Outstanding (Correct) |
|-----------|-------|----------|------|-----------------------|
| 1043521   | $100  | $5       | $50  | $45 ✅                |
| 1043520   | $299  | $0       | $290 | $9 ✅                 |
| 1043518   | $99   | $0       | $90  | $9 ✅                 |

## Consistency Check

### Booking Detail Page
Already correct:
```typescript
// In /app/api/booking-orders/[id]/route.ts
const outstanding = totalAfterDiscount - paid
// where totalAfterDiscount = totalCost - discount
```

### Booking List Page
Now fixed to match detail page logic:
```typescript
// In /app/api/booking-orders/route.ts
const outstanding = (totalCost - discount) - paid
```

Both now use the same formula: **(Total - Discount) - Paid = Outstanding** ✅

## Files Modified

1. `/app/api/booking-orders/route.ts`
   - Added `discount` field to select query (line ~105)
   - Fixed outstanding calculation to subtract discount (line ~133)

## Testing Checklist

### Test 1: Booking with Discount
1. Go to Booking Orders list page
2. Find Booking #1043521 (or any booking with discount)
3. Check Outstanding amount
4. ✅ Should show $45 (not $50)

### Test 2: Booking without Discount
1. Check Booking #1043520 or #1043518
2. Outstanding calculation remains correct
3. ✅ Should still work as before

### Test 3: Outstanding Filter
1. Use "Outstanding (Before Date)" filter
2. Select a date
3. ✅ Should only show bookings with outstanding > 0 (after discount)
4. ✅ Outstanding amounts should be correct

### Test 4: Consistency Check
1. Click into a booking detail page
2. Note the Outstanding amount
3. Go back to list page
4. ✅ Outstanding amount should match

### Test 5: New Payment
1. Make a payment on a booking with discount
2. Check list page Outstanding updates correctly
3. Example: $100 - $5 discount - $60 paid = $35 outstanding
4. ✅ Should show $35

## Expected Results

✅ Outstanding in list matches detail page
✅ Discount is properly deducted from outstanding
✅ Bookings without discount still calculate correctly
✅ Outstanding filter works with corrected amounts
✅ Payment updates reflect proper outstanding calculation

## Formula Reference

```
Outstanding = (Total Cost - Discount) - Total Paid

Where:
- Total Cost = Sum of all items
- Discount = Booking discount (can be 0)
- Total Paid = Sum of all payments
```

---
**Fixed**: June 11, 2026
**Issue**: Outstanding not considering discount in booking list
**Root Cause**: Discount field not queried and not used in calculation
**Solution**: Added discount to query and updated outstanding formula
