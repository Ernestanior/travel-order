# Receipt 序列号政策说明 (Receipt Number Policy)

## 📋 政策概述

为满足政府审计要求，系统对 Payment Receipt 采用以下政策：

### ✅ 允许的操作
- **修改金额**：可以修改任何已创建的 Payment 金额
- **作废 Payment**：可以将 Payment 金额改为 $0.00 来作废

### ❌ 禁止的操作
- **删除 Payment**：不允许删除任何已创建的 Payment 记录

## 🎯 政策目的

### 1. 保持序列号连续性
Receipt 序列号（如 RI00001, RI00002, RI00003...）必须保持连续，不能出现空缺：
- ✅ 正确：RI00001, RI00002, RI00003, RI00004...
- ❌ 错误：RI00001, RI00002, [已删除], RI00004...（中间缺少 RI00003）

### 2. 满足审计要求
政府审计时需要：
- 能够追踪所有曾经创建的 Receipt
- 查看哪些 Payment 被作废（金额为 0）
- 确保没有 Receipt 被彻底删除

### 3. 审计追踪
保留所有 Payment 记录（即使金额为 0）可以：
- 提供完整的财务历史
- 防止数据被恶意删除
- 满足合规要求

## 💡 使用场景

### 场景 1：发现输入错误
**问题**：创建 Payment 时输入错误金额

**解决方案**：
```
1. 点击 Payment 旁边的 Edit 图标
2. 修改为正确的金额
3. 输入密码 654321
4. 点击 Update
```

### 场景 2：需要作废 Payment
**问题**：客户取消付款，需要作废这条 Receipt

**解决方案**：
```
1. 点击 Payment 旁边的 Edit 图标
2. 将金额改为 0.00
3. 输入密码 654321
4. 点击 Update

结果：
- Receipt 记录仍然存在（序列号保持连续）
- 金额显示为 $0.00
- Outstanding 金额会相应增加
```

### 场景 3：客户部分退款
**问题**：客户要求部分退款

**解决方案**：
```
1. 点击 Payment 旁边的 Edit 图标
2. 修改金额为退款后的金额
   例如：原金额 $1000，退款 $200，改为 $800
3. 输入密码 654321
4. 点击 Update
```

## 📊 Receipt 列表显示

在 Receipt 页面中，系统会显示所有 Payment，包括：

### 正常 Payment
```
RI00001  |  T100026  |  08-07-2026  |  CUSTOMER NAME  |  Bank Transfer  |  $4,536.00
RI00002  |  T100002  |  03-07-2026  |  CUSTOMER NAME  |  Bank Transfer  |  $8,829.00
```

### 已作废的 Payment（金额为 0）
```
RI00003  |  T100019  |  06-07-2026  |  CUSTOMER NAME  |  Cash          |  $0.00  [VOIDED]
```

## 🔍 常见问题

### Q1: 为什么不能删除 Payment？
**A:** 为了满足政府审计要求，必须保持 Receipt 序列号的连续性。删除会导致序列号出现空缺，不符合审计标准。

### Q2: 如果发现序列号已经跳号了怎么办？
**A:** 检查是否有以下情况：
1. **数据库中有被删除的记录**（历史遗留问题）
2. **创建失败但序列号已分配**（事务回滚）
3. **并发创建导致的跳号**（多用户同时操作）

如果确实有跳号，可以：
- 在报表中标注跳号原因
- 创建虚拟的 $0 Payment 填补空缺（需要数据库管理员操作）
- 保留跳号状态，在审计时提供说明

### Q3: 金额为 0 的 Payment 会影响账目吗？
**A:** 不会。系统在计算 Outstanding 时会正确处理：
- 金额为 0 的 Payment 不会计入 Total Paid
- Outstanding 金额会相应增加
- 财务报表会正确反映实际情况

### Q4: 可以修改 Receipt Date 吗？
**A:** 目前不支持修改 Receipt Date。如果需要修改，请联系系统管理员。

### Q5: 可以修改 Payment Type 吗？
**A:** 目前不支持修改 Payment Type。如果输入错误，建议：
1. 将错误的 Payment 金额改为 0（作废）
2. 创建新的 Payment 记录，使用正确的 Payment Type

## 📝 最佳实践

### 1. 创建 Payment 前仔细核对
- 确认金额正确
- 确认 Payment Type 正确
- 确认 Receipt Date 正确

### 2. 定期检查 Receipt 序列
建议每月检查一次 Receipt 序列号是否连续：
```sql
-- 查询是否有跳号
SELECT 
  id,
  LAG(id) OVER (ORDER BY id) as prev_id,
  id - LAG(id) OVER (ORDER BY id) as gap
FROM booking_payment_data
WHERE id - LAG(id) OVER (ORDER BY id) > 1;
```

### 3. 审计准备
在审计前准备以下资料：
- 所有 Receipt 列表（包括金额为 0 的）
- 被作废的 Receipt 说明
- 任何序列跳号的原因说明

## 🛠️ 技术说明

### 数据库表结构
```sql
booking_payment_data
- id (自增 ID，用于 Receipt 序列号)
- receiptno (Receipt 编号，如 RI00001)
- bookno (关联的 Booking Order)
- receiptdate (Receipt 日期)
- paytype (Payment 类型)
- amountpaid (付款金额，可以为 0)
- ... (其他字段)
```

### Receipt 序列号生成
```typescript
// 使用数据库 autoincrement 自动生成
id: 1, 2, 3, 4, 5...

// 格式化为 Receipt Number
RI00001, RI00002, RI00003...
```

### 作废 Payment 的查询
```sql
-- 查询所有作废的 Payments
SELECT * FROM booking_payment_data 
WHERE amountpaid = 0;

-- 查询特定日期范围内的作废 Payments
SELECT * FROM booking_payment_data 
WHERE amountpaid = 0 
AND receiptdate BETWEEN '2026-01-01' AND '2026-12-31';
```

## 📞 支持

如有任何疑问或需要特殊处理，请联系：
- 系统管理员
- 技术支持团队

---

**最后更新时间：** 2026-07-08  
**版本：** 1.0  
**状态：** 生效中
