# PDF Invoice Table Alignment Fix - Complete

## Issue
In the PDF invoices (Booking Invoice and Exchange Order Invoice), table headers and cell content had inconsistent alignment - some left, some center, some right aligned.

## Solution
Unified ALL table alignments to CENTER for consistency.

## Changes Made

### Modified File: `/lib/pdfGenerator.ts`

#### 1. Items Table (Description, Quantity, Price, Amount)
- **Before**: 
  - Description: left (default)
  - Quantity: center
  - Price: right
  - Amount: right
- **After**: ALL CENTER

#### 2. Passengers Table (Name, Passport, DOB, DOE)
- **Before**:
  - Name: left (default)
  - Passport: left (default)
  - DOB: center
  - DOE: center
- **After**: ALL CENTER

#### 3. Outstanding Report Table
- **Before**: Mixed alignment
- **After**: ALL CENTER

#### 4. Table Headers
- **Added**: `halign: 'center'` to all `headStyles` configurations

## Technical Changes
- Replaced all instances of `halign: 'right'` with `halign: 'center'`
- Replaced all instances of `halign: 'left'` with `halign: 'center'`
- Added `halign: 'center'` to columns where alignment was not specified (defaulted to left)
- Added `halign: 'center'` to all table header styles

## Affected Functions
1. `generateBookingInvoicePDF()` - Items table and Passengers table
2. `generateExchangeInvoicePDF()` - Items table
3. `generateOutstandingReportPDF()` - Report table

## Testing
Generate PDFs for:
- ✅ Booking Order Invoice - Check items table and passengers table
- ✅ Exchange Order Invoice - Check items table
- ✅ Outstanding Report - Check report table

All table headers and cell content should now be center-aligned consistently.

## Date Completed
December 2024
