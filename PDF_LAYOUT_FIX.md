# PDF Layout Optimization Complete ✅

## Issue Fixed
**Problem**: Logo和公司文字重叠在Booking Invoice、Exchange Order Invoice和Payment Receipt中

**Root Cause**: 公司地址和联系信息使用了绝对位置（x=15），与logo（也在x=15）重叠

## Solution Applied

### Changes Made
修改了所有三个PDF生成函数中的文字位置：

#### Before (有重叠问题):
```typescript
// 公司信息文字从x=15开始，与logo重叠
doc.text(companyInfo.name, textStartX, 15)      // y=15
doc.text(companyInfo.address, 15, 21)            // x=15 重叠!
doc.text(companyInfo.address2, 15, 26)           // x=15 重叠!
doc.text(companyInfo.phone + ' | ' + companyInfo.email, 15, 31)  // x=15 重叠!
doc.text(companyInfo.gst, 15, 36)                // x=15 重叠!
```

#### After (优化后无重叠):
```typescript
// 所有文字都从textStartX开始（logo右边x=55），y轴也调整避免重叠
doc.text(companyInfo.name, textStartX, 18)      // x=55, y=18
doc.text(companyInfo.address, textStartX, 24)   // x=55, y=24
doc.text(companyInfo.address2, textStartX, 28)  // x=55, y=28
doc.text(companyInfo.phone + ' | ' + companyInfo.email, textStartX, 32)  // x=55, y=32
doc.text(companyInfo.gst, textStartX, 36)       // x=55, y=36
```

### Key Changes:
1. **X坐标统一**: 所有公司信息文字都使用 `textStartX` (55) 而不是硬编码的 15
2. **Y坐标调整**: 
   - 公司名称从 y=15 改为 y=18 (向下移动3个单位)
   - 其他信息的y坐标相应调整 (24, 28, 32, 36)
3. **字体大小调整**: 联系信息字体从9号改为8号，节省空间

### Layout Result:
```
┌────────────────────────────────────────────────────────────┐
│  [LOGO]    Travel GSH                    BOOKING INVOICE   │
│  35x35     101 Upper Cross Street...     Invoice#: xxx     │
│            #1-17V Singapore 058357       Date: 2026-xx-xx  │
│            Tel: +65 63569300 | Email...                    │
│            GST/Co. Reg No: 199205400K                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Bill To:                                                   │
│  ...                                                        │
└────────────────────────────────────────────────────────────┘
```

## Files Modified
- `/lib/pdfGenerator.ts`
  - `generateBookingInvoicePDF()` - 修复Booking Invoice排版
  - `generateExchangeInvoicePDF()` - 修复Exchange Order Invoice排版
  - `generateReceiptPDF()` - 修复Payment Receipt排版

## Testing
请测试以下场景确认排版正确：

1. **Booking Order Invoice**
   - 进入任意Booking Order详情页
   - 点击"Export PDF"按钮
   - 检查PDF中logo和文字是否分开，没有重叠

2. **Exchange Order Invoice**
   - 进入任意Exchange Order详情页
   - 点击"Export PDF"按钮
   - 检查PDF中logo和文字是否分开，没有重叠

3. **Payment Receipt**
   - 进入Receipts列表页
   - 点击任意收据的"PDF"按钮
   - 检查PDF中logo和文字是否分开，没有重叠

## Expected Result
✅ Logo显示在左上角 (15, 10, 35x35)
✅ 公司名称显示在logo右边 (55, 18)
✅ 地址和联系信息也在logo右边，纵向排列
✅ 没有任何文字与logo重叠
✅ 整体布局整洁专业

---
**Fixed**: June 11, 2026
**Issue**: Logo和文字重叠
**Solution**: 统一使用textStartX坐标，调整y轴位置
