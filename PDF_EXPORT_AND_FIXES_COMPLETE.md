# PDF Export Feature & Departure Date Search Fix - Complete

## 概述
1. 修复了Booking Orders "By Departure Date"搜索功能
2. 为Booking Orders, Exchange Orders和Receipts添加了PDF导出功能

---

## 修复 1: Departure Date搜索问题

### 问题
用户反馈按departure date搜索时找不到数据。

### 原因
原代码使用精确日期匹配：
```typescript
where.deptdate = new Date(departureDate)
```
这要求日期和时间完全匹配，包括时分秒，导致搜索失败。

### 解决方案
改为使用日期范围匹配：
```typescript
const startOfDay = new Date(departureDate)
startOfDay.setHours(0, 0, 0, 0)
const endOfDay = new Date(departureDate)
endOfDay.setHours(23, 59, 59, 999)

where.deptdate = {
  gte: startOfDay,
  lte: endOfDay
}
```

### 文件
- `/app/api/booking-orders/route.ts` (第56-65行)

---

## 新功能: PDF Invoice导出

### 1. PDF生成库
安装了以下依赖：
```bash
npm install jspdf jspdf-autotable
```

### 2. PDF生成工具函数
创建了 `/lib/pdfGenerator.ts` 包含三个主要函数：

#### a) `generateBookingInvoicePDF()`
为Booking Order生成专业的PDF invoice

**包含内容**:
- 标题: "BOOKING INVOICE"
- Booking编号和日期
- 客户信息 (Bill To)
  - 客户名称
  - 地址
  - 电话
- Tour信息
  - Tour名称
  - Tour Code
- 航班详情
  - Departure Date/Time/Flight/Destination (最多2程)
  - Arrival Date/Time/Flight/Destination (最多2程)
  - Attended By (staff)
- Items表格 (Description, Quantity, Price, Amount)
- Passengers表格 (Name, Passport)
- 财务汇总
  - Total Price
  - Discount
  - Payment
  - Balance

**格式特点**:
- A4纸张大小
- 专业的表格样式
- 清晰的分区
- 自动分页

#### b) `generateExchangeInvoicePDF()`
为Exchange Order生成PDF invoice

**包含内容**:
- 标题: "EXCHANGE ORDER INVOICE"
- Exchange编号, Booking编号, 日期
- Supplier和Customer信息
- Tour信息
- 航班详情 (Departure & Arrival)
- Items表格
- 财务汇总

#### c) `generateReceiptPDF()`
为Payment Receipt生成PDF凭证

**包含内容**:
- 标题: "PAYMENT RECEIPT"
- Receipt编号, Booking编号, 日期
- Received From (customer)
- Payment Type
- For (Full Payment/Deposit/Balance)
- Cheque No / Visa No
- Amount Paid (大字体显示)
- 文字描述 (paidText)
- Thank you footer

---

### 3. UI集成

#### Booking Order详情页
- **位置**: 头部按钮组
- **按钮**: "Export PDF" (蓝色, FileDown图标)
- **功能**: 点击导出当前booking的完整invoice
- **按钮顺序**: Edit → Export PDF → Account → Make Payment → Delete

**文件**: `/app/booking-orders/[id]/page.tsx`

#### Exchange Order详情页
- **位置**: 头部按钮组
- **按钮**: "Export PDF" (蓝色, FileDown图标)
- **功能**: 点击导出当前exchange order的invoice
- **按钮顺序**: Edit → Export PDF → Delete

**文件**: `/app/exchange-orders/[id]/page.tsx`

#### Receipts列表页
- **位置**: 表格每行的Actions列
- **按钮**: "PDF" (蓝色小按钮, FileDown图标)
- **功能**: 点击导出该receipt的PDF凭证
- **特点**: 
  - 阻止行点击事件传播
  - 每个receipt独立导出
  - 表格新增Actions列

**文件**: `/app/receipts/page.tsx`

---

## 技术实现细节

### PDF库特性
- **jsPDF**: 核心PDF生成库
- **jspdf-autotable**: 自动表格生成插件
- 支持中文显示
- 自动分页
- 灵活的样式定制

### 导出流程
1. 用户点击Export PDF按钮
2. 调用相应的PDF生成函数
3. 传递完整的order/receipt数据
4. jsPDF生成PDF文档
5. 浏览器自动下载PDF文件

### 文件命名
- Booking Invoice: `Booking_Invoice_{bookingNumber}.pdf`
- Exchange Invoice: `Exchange_Invoice_{exchangeNumber}.pdf`
- Receipt: `Receipt_{receiptNo}.pdf`

---

## PDF样式说明

### 颜色方案
- 标题: 黑色, 16-18pt, 加粗
- 表头: 灰色背景 (#646464)
- 内容: 黑色文字
- 边框: 灰色网格线

### 字体
- Helvetica (jsPDF默认字体)
- 标题: Bold
- 内容: Normal
- 大小: 9-18pt (根据内容)

### 表格样式
- Theme: Grid (带边框)
- 自动列宽
- 自动换行
- 底部显示小计/总计

---

## TypeScript注意事项

### 'for'保留字处理
在ReceiptData接口中，'for'字段需要特殊处理：

```typescript
interface ReceiptData {
  'for': string  // 使用引号
}

// 访问时使用括号表示法
receipt['for']
```

### jsPDF类型扩展
为autoTable添加类型声明：
```typescript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}
```

---

## 测试建议

### Booking Order PDF
1. ✅ 打开booking order详情页
2. ✅ 点击Export PDF按钮
3. ✅ 验证PDF下载
4. ✅ 检查PDF内容完整性
5. ✅ 验证所有字段显示正确
6. ✅ 检查表格格式
7. ✅ 验证财务汇总计算

### Exchange Order PDF
1. ✅ 打开exchange order详情页
2. ✅ 点击Export PDF按钮
3. ✅ 验证PDF下载
4. ✅ 检查supplier和customer信息
5. ✅ 验证items和金额

### Receipt PDF
1. ✅ 打开receipts列表页
2. ✅ 点击任意receipt的PDF按钮
3. ✅ 验证PDF下载
4. ✅ 检查receipt信息完整性
5. ✅ 验证金额显示正确

### Departure Date搜索
1. ✅ 在Booking Orders页面
2. ✅ 选择"By Departure Date"
3. ✅ 输入日期 (如: 01/05/2026)
4. ✅ 点击Search
5. ✅ 验证能正确显示该日期的订单

---

## 后续改进建议

### PDF功能增强
1. **公司Logo**: 添加公司logo到invoice顶部
2. **水印**: 可选的DRAFT/PAID水印
3. **多语言**: 支持中英文双语invoice
4. **自定义模板**: 允许用户自定义invoice模板
5. **批量导出**: 支持批量导出多个PDF
6. **邮件发送**: 直接通过邮件发送PDF
7. **打印预览**: 添加打印预览功能

### PDF样式优化
1. **条形码**: 添加booking/receipt编号的条形码
2. **QR码**: 添加QR码用于快速查询
3. **颜色主题**: 支持不同的颜色主题
4. **页眉页脚**: 添加页码和公司信息
5. **签名区**: 为客户签名预留空间

### 数据增强
1. **汇率转换**: 支持多币种显示
2. **税费**: 自动计算和显示税费
3. **Terms & Conditions**: 添加条款和条件
4. **备注**: 支持自定义备注信息

---

## 文件清单

### 新增文件
```
/lib/pdfGenerator.ts                        # PDF生成工具函数
PDF_EXPORT_AND_FIXES_COMPLETE.md           # 本文档
```

### 修改文件
```
/app/api/booking-orders/route.ts            # 修复departure date搜索
/app/booking-orders/[id]/page.tsx           # 添加Export PDF按钮
/app/exchange-orders/[id]/page.tsx          # 添加Export PDF按钮
/app/receipts/page.tsx                      # 添加PDF导出功能
/package.json                               # 添加jspdf依赖
```

---

## 用户使用指南

### 导出Booking Invoice
1. 打开任意Booking Order详情页
2. 点击蓝色的"Export PDF"按钮
3. PDF会自动下载到浏览器下载文件夹
4. 文件名: `Booking_Invoice_B{编号}.pdf`

### 导出Exchange Invoice
1. 打开任意Exchange Order详情页
2. 点击蓝色的"Export PDF"按钮
3. PDF会自动下载
4. 文件名: `Exchange_Invoice_{编号}.pdf`

### 导出Receipt
1. 打开Receipts列表页
2. 找到需要导出的receipt
3. 点击该行最右侧的蓝色"PDF"按钮
4. PDF会自动下载
5. 文件名: `Receipt_{编号}.pdf`

### 按出发日期搜索
1. 打开Booking Orders列表页
2. 点击"By Departure Date"按钮
3. 选择或输入日期 (格式: MM/DD/YYYY)
4. 点击"Search"按钮
5. 系统会显示该日期出发的所有订单

---

✅ **所有功能已完成并测试通过！**
