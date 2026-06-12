# Invoice Address Display Fix ✅

## Issues Fixed

根据用户截图反馈，修复了以下问题：

### 1. ✅ 客户地址显示问题
**问题**: Bill To部分的address字段有条件判断，当address为空时不显示任何内容，导致排版不一致

**Before**:
```typescript
if (data.address) {
  doc.text(`Address: ${data.address}`, 15, y)
  y += 5
}
```

**After**:
```typescript
doc.text(data.address || '', 15, y)
y += 5
```

**结果**: 
- 地址字段现在总是占用一行空间
- 如果有地址，显示地址内容
- 如果没有地址，显示空行（保持排版一致）
- Telephone总是在地址下方一行

### 显示格式
```
Bill To:
[Customer Name]
[Address or empty line]
Telephone: [Phone Number]
```

## Modified Files
- `/lib/pdfGenerator.ts` - `generateBookingInvoicePDF()` 函数

## Testing
请测试Booking Invoice PDF导出：

1. **有地址的订单**:
   ```
   Bill To:
   Customer Name
   123 Main Street
   Telephone: 12345678
   ```

2. **无地址的订单**:
   ```
   Bill To:
   Customer Name
   
   Telephone: 12345678
   ```

## Expected Result
✅ 客户名称显示正确
✅ 地址总是占用一行（有内容显示内容，无内容显示空行）
✅ Telephone始终在固定位置
✅ 排版整齐一致

---
**Fixed**: June 11, 2026
**Issue**: Bill To部分地址字段显示不一致
**Solution**: 移除条件判断，地址总是占用一行空间
