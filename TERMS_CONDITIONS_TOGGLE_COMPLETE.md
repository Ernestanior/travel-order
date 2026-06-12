# Terms & Conditions Toggle for Invoice - COMPLETED ✅

## Summary
Successfully implemented an optional Terms & Conditions section for the booking invoice PDF. A checkbox toggle allows users to include or exclude the T&C when exporting the PDF.

## Changes Implemented

### 1. PDF Generator Interface
**File**: `lib/pdfGenerator.ts`

- ✅ Added `includeTerms?: boolean` field to `BookingInvoiceData` interface
- ✅ Field is optional and defaults to false (T&C not included by default)

### 2. PDF Generator Function
**File**: `lib/pdfGenerator.ts` - `generateBookingInvoicePDF()`

- ✅ Added comprehensive Terms & Conditions section on a new page when enabled
- ✅ Section only renders if `data.includeTerms === true`
- ✅ Content includes:
  - **TRAVEL DOCUMENTS** section (English)
  - Chinese translation of travel documents requirements
  - **CANCELLATION CHARGE** section
  - Closing statement: "Yours faithfully, Travel GSH Pte Ltd"
  - Signature lines for Authorised Signature and Customer Signature/Date

### 3. Booking Detail Page
**File**: `app/booking-orders/[id]/page.tsx`

- ✅ Added `includeTerms` state variable (default: false)
- ✅ Added checkbox toggle in the header section
- ✅ Toggle label: "Include Terms & Conditions in PDF"
- ✅ Toggle only visible when not in edit mode
- ✅ Checkbox value passed to PDF generator via `includeTerms` parameter
- ✅ Positioned above the button group for easy access

## Terms & Conditions Content

### Page Layout
- **New Page**: T&C appears on a separate page (page 2)
- **Title**: "TERMS & CONDITIONS" (centered, bold, 12pt)

### Sections:

#### 1. TRAVEL DOCUMENTS (English)
- Passport validity requirements
- Tour voucher requirements
- Visa and vaccination information
- Responsibility disclaimers
- National Service eligibility

#### 2. TRAVEL DOCUMENTS (Chinese)
- Chinese translation of key travel document requirements
- 4 lines of Chinese text explaining visa, passport, and entry requirements

#### 3. CANCELLATION CHARGE
- Payment non-refundable policy
- 100% charge for issued tickets
- Peak season cancellation policy
- Agreement acknowledgment statement

#### 4. Closing
- "Yours faithfully,"
- "Travel GSH Pte Ltd"

#### 5. Signature Section
- Authorised Signature line
- Customer Signature and Date lines

## UI Design

### Toggle Checkbox
```
□ Include Terms & Conditions in PDF
```

- **Location**: Top right, above buttons in booking detail page
- **Appearance**: Only visible when not in edit mode
- **Style**: Standard checkbox with label
- **Alignment**: Right-aligned with button group
- **Color**: Blue accent when checked

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Booking #1043515                                        │
│ Created on 2026-04-27                                   │
│                                                          │
│                    □ Include Terms & Conditions in PDF  │
│                    [Open] [Edit] [Export PDF] [...]     │
└─────────────────────────────────────────────────────────┘
```

## PDF Behavior

### When Toggle is OFF (default)
- PDF contains only the invoice (single page)
- No Terms & Conditions page

### When Toggle is ON
- PDF contains invoice (page 1) + Terms & Conditions (page 2)
- Complete T&C text with all sections
- Signature lines for authorization

## User Workflow

1. Open booking order detail page
2. See checkbox above buttons: "Include Terms & Conditions in PDF"
3. Check the box if T&C should be included
4. Click "Export PDF" button
5. PDF downloads with or without T&C based on checkbox state

## Technical Details

### State Management
```typescript
const [includeTerms, setIncludeTerms] = useState(false)
```

### Toggle Component
```typescript
<input
  type="checkbox"
  checked={includeTerms}
  onChange={(e) => setIncludeTerms(e.target.checked)}
  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
/>
```

### PDF Generation
```typescript
await generateBookingInvoicePDF({
  // ... other fields
  includeTerms: includeTerms,
})
```

## Text Content Details

### Travel Documents (English)
- 10 lines explaining passport, visa, vaccination requirements
- National Service eligibility notes

### Travel Documents (Chinese)
- 4 lines of Chinese text covering key requirements

### Cancellation Charge
- 7 lines explaining cancellation policies
- Non-refundable payment notice
- Peak season policies

### Font Sizes
- Title: 12pt bold
- Section headers: 10pt bold
- Body text: 8pt normal
- Signature labels: 8pt normal

## Testing Checklist

- ⏳ User to test: Export PDF with toggle OFF (no T&C)
- ⏳ User to test: Export PDF with toggle ON (includes T&C)
- ⏳ User to test: Verify T&C appears on page 2
- ⏳ User to test: Verify all sections are present
- ⏳ User to test: Verify Chinese characters display correctly
- ⏳ User to test: Verify signature lines are properly positioned
- ⏳ User to test: Toggle persists during session but resets on page reload

## Notes

- Toggle state does NOT persist between page reloads (resets to false)
- T&C always appears on a new page (page 2)
- Invoice content (page 1) remains unchanged
- Checkbox only appears when viewing (not in edit mode)
- Default state is OFF (unchecked) - T&C must be explicitly enabled
- Supports both English and Chinese text rendering
