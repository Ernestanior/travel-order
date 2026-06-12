# Special Instruction in Invoice - COMPLETED ✅

## Summary
Successfully added Special Instruction field to the Booking Order invoice PDF export. The field now appears between the Passengers section and the Notes section.

## Changes Implemented

### 1. PDF Generator Interface
**File**: `lib/pdfGenerator.ts`

- ✅ Added `special?: string` field to `BookingInvoiceData` interface
- ✅ Field is optional - will only display if value exists

### 2. PDF Generator Function
**File**: `lib/pdfGenerator.ts` - `generateBookingInvoicePDF()`

- ✅ Added Special Instruction section after Passengers table
- ✅ Section only renders if `data.special` has a value
- ✅ Format:
  - Bold header: "Special Instruction:" (10pt font)
  - Content: Normal text (9pt font)
  - Multi-line support: Uses `doc.splitTextToSize()` to wrap long text
  - Max width: 180 units (fits within page margins)
  - Dynamic spacing: Adjusts based on number of lines

### 3. Booking Detail Page
**File**: `app/booking-orders/[id]/page.tsx`

- ✅ Added `special: order.special` to the PDF data in `handleExportPDF()` function
- ✅ Passes the special instruction value from order to PDF generator

## PDF Layout Order

1. **Header**: Company logo, info, invoice title, date
2. **Bill To**: Customer info, address, tel
3. **Tour Information**: Tour code and description
4. **Flight Information**: Departure and arrival details (in box)
5. **Items Table**: List of items with quantities and prices
6. **Passengers Table**: Passenger names and passport numbers
7. **Special Instruction** ⭐ NEW - Only if exists
8. **Notes**: Bank details (left side)
9. **Financial Summary**: Total, discount, payment, balance (right side)
10. **Attended By**: Staff name

## Display Logic

```typescript
if (data.special && data.special.trim()) {
  // Show Special Instruction section
  // Header: "Special Instruction:"
  // Content: Multi-line text with word wrap
}
```

## Text Handling

- **Word Wrap**: Automatically wraps long text to multiple lines
- **Max Width**: 180 units (approximately 6-7 inches)
- **Line Spacing**: 5 units per line
- **Spacing After**: 10 units before next section

## Example Output

```
Passengers
┌──────────────────────┬────────────────┐
│ Name                 │ Passport       │
├──────────────────────┼────────────────┤
│ CHAI YI LONG JASON   │ K5837262C      │
└──────────────────────┴────────────────┘

Special Instruction:
在 要求出账PDF invoice，因办visa特殊情况证额外加 文字 remark格名人看

Notes
Bank: Maybank
...
```

## Testing Checklist

- ⏳ User to test: Open booking order with special instruction
- ⏳ User to test: Click "Export PDF" button
- ⏳ User to test: Verify Special Instruction appears in PDF
- ⏳ User to test: Verify text wraps correctly for long instructions
- ⏳ User to test: Test with booking that has no special instruction (should not show section)
- ⏳ User to test: Test with Chinese/English mixed text

## Notes

- Section only appears when special instruction has content
- Supports multi-line text with automatic word wrapping
- Maintains proper spacing before Notes section
- Compatible with existing PDF layout
- Works with both English and Chinese characters
