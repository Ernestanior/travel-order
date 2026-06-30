# 清除数据库并重置 ID 序列

## 概述
此脚本将清除所有 Booking Orders、Exchange Orders 和 Payment Receipts，但保留 Customers 和 Suppliers 数据。

## 新的 ID 格式

### Booking Orders
- **格式**: T100001, T100002, T100003...
- **前缀**: T (Ticket)
- **起始**: 100001

### Exchange Orders
- **格式**: 1100001, 1100002, 1100003...
- **前缀**: 1 (Exchange 标识)
- **起始**: 100001

### Payment Receipts
- **格式**: R100001, R100002, R100003...
- **前缀**: R (Receipt)
- **起始**: 100001

## 执行步骤

### 1. 备份数据库（重要！）
在执行清理之前，请先备份数据库：

```bash
# 使用 pg_dump 备份
pg_dump -h your-host -U your-user -d your-database > backup_$(date +%Y%m%d_%H%M%S).sql
```

或者使用 Supabase Dashboard 的备份功能。

### 2. 执行清理脚本

```bash
# 安装依赖（如果还没安装）
npm install

# 执行清理脚本
npx tsx scripts/clear-and-reset-data.ts
```

### 3. 验证结果

脚本执行完成后，会显示：
- 删除的记录数量
- 保留的 Customers 和 Suppliers 数量
- ID 序列重置确认

预期输出：
```
✅ ✅ ✅ SUCCESS! All data cleaned successfully!

📝 Summary:
   - All Booking Orders deleted
   - All Exchange Orders deleted
   - All Payments deleted
   - All Items deleted
   - All Passengers deleted
   - Customers retained ✅
   - Suppliers retained ✅

🆔 New ID sequences:
   - Booking Orders: T100001, T100002, T100003...
   - Exchange Orders: 1100001, 1100002, 1100003...
   - Payment Receipts: R100001, R100002, R100003...
```

## 脚本将删除的数据

### ❌ 删除：
- ✅ 所有 Booking Orders (`booking_data`)
- ✅ 所有 Booking Items (`item_data`)
- ✅ 所有 Passengers (`passenger_data`)
- ✅ 所有 Booking Payments (`booking_payment_data`)
- ✅ 所有 Exchange Orders (`exchange_data`)
- ✅ 所有 Exchange Items (`exchange_item_data`)
- ✅ 所有 Exchange Payments (`exchange_payment_data`)

### ✅ 保留：
- ✅ 所有 Customers (`customer_data`)
- ✅ 所有 Suppliers (`supplier_data`)

## 代码修改说明

已修改以下文件以使用新的 ID 格式：

### 1. Booking Order 创建
**文件**: `/app/api/booking-orders/create/route.ts`
- 生成格式：T100001, T100002...
- 基于数据库 ID 序列生成

### 2. Exchange Order 创建
**文件**: `/app/api/exchange-orders/create/route.ts`
- 生成格式：1100001, 1100002...
- 基于数据库 ID 序列生成

### 3. Payment Receipt 生成
**文件**: `/app/api/payments/next-receipt-no/route.ts`
- 生成格式：R100001, R100002...
- 基于数据库 ID 序列生成

## 测试新 ID 格式

执行清理后，测试创建新记录：

### 测试 Booking Order
1. 打开应用，进入 Booking Orders
2. 点击 "New Booking Order"
3. 填写信息并保存
4. 验证 Booking Number 为 **T100001**

### 测试 Exchange Order
1. 基于刚创建的 Booking Order 创建 Exchange Order
2. 保存后验证 Exchange Number 为 **1100001**

### 测试 Payment Receipt
1. 为 Booking Order 添加付款
2. 验证 Receipt Number 为 **R100001**

## 回滚

如果需要回滚：

```bash
# 从备份恢复
psql -h your-host -U your-user -d your-database < backup_YYYYMMDD_HHMMSS.sql
```

## 注意事项

⚠️ **警告**：
1. 此操作**不可逆**，执行前必须备份
2. 清理期间系统应该处于维护模式，禁止用户访问
3. 清理完成后，第一个创建的记录将使用新的起始 ID

✅ **安全**：
1. 脚本会验证删除操作是否成功
2. ID 序列重置为正确的起始值
3. 保留所有 Customer 和 Supplier 数据

## 常见问题

### Q: 为什么选择这些 ID 格式？
A: 
- **T100001**: T 代表 Ticket/Travel，便于识别为机票订单
- **1100001**: 1 开头代表 Exchange，与 Booking 区分
- **R100001**: R 代表 Receipt，清晰表明是收据

### Q: ID 会冲突吗？
A: 不会。每种类型使用独立的数据库序列和前缀，确保唯一性。

### Q: 可以保留部分订单吗？
A: 当前脚本会删除所有订单。如需保留特定订单，请修改脚本添加过滤条件。

## 支持

如有问题，请检查：
1. 数据库连接是否正常
2. Prisma Client 是否最新：`npx prisma generate`
3. 备份是否已创建

---

**执行前请务必确认已备份数据库！**
