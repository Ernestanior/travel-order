# Payment Receipts 批量导出功能

## 功能概述

Payment Receipts 页面现在支持批量导出 PDF 功能。客户可以选择一个日期范围（例如 7月1日 到 7月31日），搜索出符合条件的所有收据，然后一键导出所有收据到一个 PDF 文件中，PDF 会以表格形式汇总显示。

## 使用方法

### 1. 访问 Payment Receipts 页面
- 从主菜单进入 "Payment Receipts" 页面
- URL: `/receipts`

### 2. 设置搜索条件（可选）
您可以通过以下任意条件筛选收据：
- **Receipt #**: 收据号码
- **Booking #**: 订单号码
- **Customer**: 客户名称
- **Date Range**: 日期范围（重点功能）
  - From: 开始日期
  - To: 结束日期

### 3. 搜索收据
- 设置好筛选条件后，点击 "Search" 按钮
- 系统会显示符合条件的收据数量

### 4. 批量导出 PDF
- 在页面右上角会出现 **"Export All to PDF"** 按钮（绿色）
- 点击此按钮后：
  1. 系统会弹出确认对话框，显示将要导出的收据数量
  2. 确认后，系统会自动获取所有符合条件的收据
  3. 生成一个包含所有收据的 PDF 文件（表格汇总格式）
  4. 自动下载到您的电脑

### 5. PDF 文件命名规则
- 如果选择了日期范围: `Payment_Receipts_2026-07-01_to_2026-07-31.pdf`
- 如果只选择了开始日期: `Payment_Receipts_from_2026-07-01.pdf`
- 如果只选择了结束日期: `Payment_Receipts_to_2026-07-31.pdf`
- 如果没有日期筛选: `Payment_Receipts.pdf`

## PDF 格式说明

导出的 PDF 采用表格汇总格式，包含以下内容：

### 1. 标题行
```
Receipt Date From    1/6/2026    To 30/6/2026
```

### 2. 表格列
| Receipt | Date | Type | Payment Method | Amount | Customer |
|---------|------|------|----------------|--------|----------|
| 1058427 | 2/6/2026 | Full | Cash | $355.00 | LIANG HONGQUAN |
| 1058428 | 3/6/2026 | Full | Bank Transfer | $8,829.00 | SINOHYDRO... |

**列说明：**
- **Receipt**: 收据编号
- **Date**: 收据日期（格式：D/M/YYYY）
- **Type**: 支付类型（Full/Deposit/Balance1）
- **Payment Method**: 支付方式（Cash/Cheque/Nets/PayNow/Bank Transfer/Credit Card）
- **Amount**: 金额
- **Customer**: 客户名称

### 3. 底部汇总
```
Sub-Total for Cash :           $18,425.60
Sub-Total for Cheque :         $13,065.83
Sub-Total for Nets :                $0.00
Sub-Total for PayNow :         $50,000.00
Sub-Total for Bank Transfer :  $257,668.78
Sub-Total for Credit Card :         $0.00
Grand Total :                  $289,160.21
```

**汇总说明：**
- 按支付方式分类统计小计
- 显示总计（Grand Total）

## 示例场景

### 场景 1: 导出整个月的收据
```
1. 在 Date Range From 输入: 2026-06-01
2. 在 Date Range To 输入: 2026-06-30
3. 点击 "Search"
4. 查看搜索结果（例如：Found 150 receipt(s)）
5. 点击 "Export All to PDF"
6. 确认导出
7. 下载文件: Payment_Receipts_2026-06-01_to_2026-06-30.pdf
8. PDF 显示该月所有收据的表格汇总
```

### 场景 2: 导出特定客户的所有收据
```
1. 在 Customer 输入: INFINIZ TOURS
2. 点击 "Search"
3. 点击 "Export All to PDF"
4. 下载文件包含该客户的所有收据汇总表
```

### 场景 3: 月度财务报表
```
1. 选择日期范围: 2026-07-01 to 2026-07-31
2. 导出 PDF
3. PDF 自动生成：
   - 该月所有收据明细
   - 按支付方式的分类统计
   - 现金收入总额
   - Cheque 收入总额
   - PayNow 收入总额
   - Bank Transfer 收入总额
   - Credit Card 收入总额
   - 当月总收入
```

## 支付方式映射

系统会自动识别并映射支付方式：

| 原始支付类型 | PDF 显示 |
|--------------|----------|
| Cash | Cash |
| PayNow | PayNow |
| Bank Transfer / GIRO | Bank Transfer |
| Credit Card / Visa | Credit Card |
| Cheque / Check | Cheque |
| Nets | Nets |

## 技术实现

### 新增函数
- `generateBatchReceiptsPDF()` 在 `/lib/pdfGenerator.ts`
  - 表格格式显示所有收据
  - 自动计算各支付方式小计
  - 计算总计
  - 使用 Courier 字体保持对齐

### 页面更新
- `/app/receipts/page.tsx`
  - 添加 "Export All to PDF" 按钮
  - 实现 `handleExportAll()` 函数
  - 添加导出状态提示

### API 使用
- 使用现有的 `/api/receipts` API
- 通过设置 `limit` 参数为总记录数来获取所有符合条件的数据

## 优势

✅ **表格汇总格式**: 清晰的表格视图，类似 Excel 报表  
✅ **自动分类统计**: 按支付方式自动计算小计  
✅ **财务报表**: 适合会计和财务对账  
✅ **一键导出**: 不需要逐个下载每个收据  
✅ **日期范围**: 支持按月、按季度、按年导出  
✅ **灵活筛选**: 可以结合多个条件筛选  
✅ **即时下载**: 浏览器端直接生成，无需等待

## 注意事项

1. **格式特点**: 
   - 表格格式，不是单个收据格式
   - 适合批量查看和统计
   - 日期格式为 D/M/YYYY（如：2/6/2026）

2. **支付方式**: 
   - 自动识别并归类支付方式
   - 底部显示各种支付方式的小计

3. **统计功能**:
   - 自动计算 Cash 总额
   - 自动计算 Cheque 总额
   - 自动计算 Nets 总额
   - 自动计算 PayNow 总额
   - 自动计算 Bank Transfer 总额
   - 自动计算 Credit Card 总额
   - 显示 Grand Total（总计）

4. **性能考虑**: 
   - 导出大量收据（例如 1000+ 条）可能需要几秒钟时间
   - 导出期间会显示 "Exporting..." 状态

## 常见问题

**Q: 导出的格式是什么样的？**  
A: 表格汇总格式，包含所有收据信息和按支付方式的统计汇总。

**Q: 如何查看单个收据的详细信息？**  
A: 点击表格中每一行的 "PDF" 按钮，可以导出单个收据的详细格式。

**Q: 底部的小计是如何计算的？**  
A: 系统自动识别每个收据的支付方式，然后按 Cash、Cheque、Nets、PayNow、Bank Transfer、Credit Card 分类统计。

**Q: 可以导出多少条收据？**  
A: 理论上没有限制，但建议一次导出不超过 1000 条。

**Q: 日期格式为什么不同？**  
A: 批量导出使用 D/M/YYYY 格式（如 2/6/2026），这是财务报表的常用格式。

## 使用场景

### 📊 月度财务报表
导出整月收据，查看各支付方式收入分布

### 💰 现金对账
筛选日期范围，导出查看现金收入总额

### 🏦 银行对账
查看 Bank Transfer 和 Cheque 的收入明细和总额

### 📱 PayNow 统计
统计 PayNow 支付方式的使用情况和收入

### 📈 收入分析
按日期范围导出，分析不同支付方式的使用趋势

## 更新日志

- **2026-07-13**: 更新为表格汇总格式
  - 采用表格视图显示所有收据
  - 添加按支付方式的小计统计
  - 支付方式更新为：Cash, Cheque, Nets, PayNow, Bank Transfer, Credit Card
  - 添加 Grand Total 总计
  - 日期格式改为 D/M/YYYY

- **2026-07-13**: 初始版本发布
  - 支持批量导出 PDF
  - 支持日期范围筛选
  - 支持自动文件命名
