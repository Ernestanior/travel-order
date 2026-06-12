# Exchange Order Supplier Information Fix ✅

## Summary
Added supplier address and telephone fields to Exchange Order, similar to the customer address/tel functionality in Booking Order.

## Changes Made

### 1. Database Integration

#### API - GET Request
- **File**: `/app/api/exchange-orders/[id]/route.ts`
- **Changes**:
  - Added `supplierData` to the include clause
  - Returns `supplierAddress` and `supplierTel` from `supplierData` relation
  
```typescript
include: {
  supplierData: true,  // Added
  // ... other includes
}

// In formatted response:
supplierAddress: exchange.supplierData?.address || '',
supplierTel: exchange.supplierData?.tel || '',
```

#### API - PUT Request
- **File**: `/app/api/exchange-orders/[id]/route.ts`
- **Changes**:
  - Added Supplier upsert logic before updating Exchange Order
  - Updates or creates Supplier record with address and tel
  
```typescript
// 先更新或创建 Supplier 记录
if (body.supplier && (body.supplierTel || body.supplierAddress)) {
  await prisma.supplier.upsert({
    where: { supplier: body.supplier },
    update: {
      address: body.supplierAddress || null,
      tel: body.supplierTel || null,
    },
    create: {
      supplier: body.supplier,
      address: body.supplierAddress || null,
      tel: body.supplierTel || null,
    }
  })
}
```

### 2. Frontend - Detail Page

#### Interface Update
- **File**: `/app/exchange-orders/[id]/page.tsx`
- **Changes**: Added `supplierAddress` and `supplierTel` to `ExchangeOrder` interface

```typescript
interface ExchangeOrder {
  // ... existing fields
  supplier: string
  supplierAddress: string  // Added
  supplierTel: string      // Added
  // ... other fields
}
```

#### UI Update
- **Location**: Exchange Information section
- **Changes**: Added two new fields:
  1. **Supplier Address** - Textarea (2 rows) for editing, text display when viewing
  2. **Supplier Tel** - Text input for editing, text display when viewing

```typescript
<div>
  <label>Supplier Address</label>
  {isEditing ? (
    <textarea value={displayData.supplierAddress || ''} rows={2}
      onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })}
      className="..." />
  ) : (
    <p>{order.supplierAddress || '-'}</p>
  )}
</div>

<div>
  <label>Supplier Tel</label>
  {isEditing ? (
    <input type="text" value={displayData.supplierTel || ''}
      onChange={(e) => setFormData({ ...formData, supplierTel: e.target.value })}
      className="..." />
  ) : (
    <p>{order.supplierTel || '-'}</p>
  )}
</div>
```

## Data Flow

### Read Flow (GET)
```
GET /api/exchange-orders/[id]
↓
Query exchange_data with supplierData relation
↓
Return supplier name + address + tel from supplier_data table
↓
Frontend displays in Exchange Information section
```

### Write Flow (PUT)
```
User edits Supplier Address/Tel → Save
↓
PUT /api/exchange-orders/[id]
↓
1. Upsert supplier_data table (address, tel)
2. Update exchange_data table (supplier name, other fields)
3. Update items if provided
↓
Success response
↓
Frontend reloads data
↓
Supplier Address/Tel persist after refresh ✅
```

## Database Schema

### supplier_data table
```sql
supplier (PK) - VARCHAR(200)
address       - VARCHAR(255) - nullable
tel           - VARCHAR(50)  - nullable
fax           - VARCHAR(50)  - nullable
```

### exchange_data table
```sql
id         - INT (PK)
exchangeno - VARCHAR(50)
supplier   - VARCHAR(200) (FK -> supplier_data.supplier)
...
```

## Features

### View Mode
- Displays supplier name, address, and tel
- Shows "-" for empty address/tel fields

### Edit Mode
- Supplier name: Text input (required)
- Supplier address: Textarea with 2 rows
- Supplier tel: Text input
- All fields editable
- Save updates both exchange_data and supplier_data tables

## Testing Checklist

### Test 1: Add Supplier Information
1. Open any Exchange Order detail page
2. Click "Edit" button
3. Fill in:
   - Supplier Address (e.g., "123 Business Road, Singapore")
   - Supplier Tel (e.g., "+65 12345678")
4. Click "Save"
5. Refresh page (F5)
6. ✅ Supplier address and tel should persist

### Test 2: Update Existing Supplier
1. Open Exchange Order with supplier info
2. Click "Edit"
3. Modify supplier address/tel
4. Click "Save"
5. Refresh page
6. ✅ Changes should be saved

### Test 3: Multiple Exchange Orders - Same Supplier
1. Open Exchange Order #1 with Supplier "ABC"
2. Set address to "Address 1"
3. Save
4. Open Exchange Order #2 with same Supplier "ABC"
5. Edit and set address to "Address 2"
6. Save
7. Go back to Exchange Order #1
8. ✅ Should show "Address 2" (supplier_data is shared across all exchanges)

### Test 4: Export PDF
1. Exchange Order with supplier info
2. Click "Export PDF"
3. ✅ PDF should include supplier information (already implemented)

### Test 5: Make Payment
1. Exchange Order detail page
2. Click "Make Payment"
3. ✅ Payment modal should work (already implemented)

## Files Modified

1. `/app/api/exchange-orders/[id]/route.ts`
   - Added `supplierData` include in GET
   - Added `supplierAddress` and `supplierTel` to response
   - Added Supplier upsert in PUT

2. `/app/exchange-orders/[id]/page.tsx`
   - Updated `ExchangeOrder` interface
   - Added Supplier Address field (editable textarea / readonly text)
   - Added Supplier Tel field (editable input / readonly text)

## Related Features

Already implemented in Exchange Order:
- ✅ Export PDF (with company logo and branding)
- ✅ Make Payment (modal with payment tracking)
- ✅ Edit/Delete functionality
- ✅ Items management
- ✅ Flight information
- ✅ Tour information

Now added:
- ✅ Supplier Address (editable, persists to database)
- ✅ Supplier Tel (editable, persists to database)

## Notes

### Supplier Data Sharing
- `supplier_data` table uses supplier name as primary key
- Multiple exchange orders can reference the same supplier
- Updating supplier address/tel affects ALL exchange orders with that supplier
- This is intentional design for data consistency

### Upsert Behavior
- If supplier exists: Updates address and tel
- If supplier doesn't exist: Creates new supplier record
- Ensures data is always saved correctly

---
**Completed**: June 11, 2026
**Features Added**: Supplier Address and Tel fields for Exchange Order
**Similar to**: Booking Order Customer Address/Tel functionality
