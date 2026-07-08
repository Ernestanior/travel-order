# 修复 Payment Receipt 序列号指南

## 问题描述
当前 Payment Receipt 序列号：1, 2, 3, 4, 8
需要修改为：1, 2, 3, 4, 5，下一个从 6 开始

## ⚠️ 重要提醒
**执行前必须备份数据库！**

## 📋 执行步骤

### 步骤 1：备份数据库
```bash
# 方法 1：使用 pg_dump 备份整个数据库
pg_dump -U your_username -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# 方法 2：只备份 payment 表
pg_dump -U your_username -d your_database -t booking_payment_data > payment_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 步骤 2：连接数据库
```bash
psql -U your_username -d your_database
```

或者如果你使用的是连接字符串：
```bash
psql "postgresql://username:password@host:5432/database"
```

### 步骤 3：检查当前数据
在执行修改前，先查看当前的数据：

```sql
-- 查看所有 Payment 记录
SELECT id, receiptno, bookno, receiptdate, amountpaid 
FROM booking_payment_data 
ORDER BY id;

-- 应该看到类似这样的结果：
-- id | receiptno | bookno   | receiptdate | amountpaid
-- ---+-----------+----------+-------------+-----------
-- 1  | RI00001   | T100015  | 2026-07-02  | 60995.00
-- 2  | RI00002   | T100002  | 2026-07-03  | 8829.00
-- 3  | RI00003   | T100010  | 2026-07-06  | 2725.00
-- 4  | RI00004   | T100021  | 2026-07-07  | 267.00
-- 8  | RI00008   | T100026  | 2026-07-08  | 4536.00  <-- 这个需要改为 5
```

### 步骤 4：执行修复脚本
```bash
# 在 psql 中执行
\i scripts/fix-payment-sequence.sql
```

或者直接执行：
```bash
psql -U your_username -d your_database < scripts/fix-payment-sequence.sql
```

### 步骤 5：验证结果
执行完成后，再次查询数据：

```sql
-- 查看修改后的数据
SELECT id, receiptno, bookno, receiptdate, amountpaid 
FROM booking_payment_data 
ORDER BY id;

-- 应该看到：
-- id | receiptno | bookno   | receiptdate | amountpaid
-- ---+-----------+----------+-------------+-----------
-- 1  | RI00001   | T100015  | 2026-07-02  | 60995.00
-- 2  | RI00002   | T100002  | 2026-07-03  | 8829.00
-- 3  | RI00003   | T100010  | 2026-07-06  | 2725.00
-- 4  | RI00004   | T100021  | 2026-07-07  | 267.00
-- 5  | RI00008   | T100026  | 2026-07-08  | 4536.00  <-- ID 已改为 5

-- 检查序列
SELECT last_value as "Current Value", last_value + 1 as "Next Value"
FROM pg_sequences 
WHERE sequencename LIKE '%booking_payment_data%';

-- 应该看到：
-- Current Value | Next Value
-- --------------+-----------
-- 5             | 6  <-- 下次创建会从 6 开始
```

### 步骤 6：更新 Receipt Number（可选）
如果你想同时更新 `receiptno` 字段（从 RI00008 改为 RI00005）：

```sql
-- 更新 Receipt Number
UPDATE booking_payment_data 
SET receiptno = 'RI00005' 
WHERE id = 5;

-- 验证
SELECT id, receiptno FROM booking_payment_data WHERE id = 5;
-- 应该显示：id=5, receiptno=RI00005
```

### 步骤 7：测试创建新 Payment
在系统中创建一个新的 Payment，验证：
1. ID 应该是 6
2. Receipt No 应该是 RI00006

## 🔄 如果出现问题怎么办？

### 情况 1：ID=5 已经存在
**错误信息：** "ID=5 already exists!"

**解决方案：**
```sql
-- 查看 ID=5 的记录
SELECT * FROM booking_payment_data WHERE id = 5;

-- 如果 ID=5 是无效数据，可以先删除
-- ⚠️ 谨慎操作！
DELETE FROM booking_payment_data WHERE id = 5;

-- 然后重新运行修复脚本
```

### 情况 2：ID=8 不存在
**错误信息：** "ID=8 does not exist!"

**解决方案：**
```sql
-- 查看所有记录
SELECT id FROM booking_payment_data ORDER BY id;

-- 找到实际需要修改的 ID
-- 修改脚本中的 8 为实际的 ID
```

### 情况 3：修改后发现错误
**解决方案：**
```sql
-- 立即回滚（如果还在事务中）
ROLLBACK;

-- 或者从备份恢复
psql -U your_username -d your_database < backup_file.sql
```

## 📝 手动修复方法（如果脚本不工作）

如果自动脚本有问题，可以手动执行：

```sql
-- 1. 开始事务
BEGIN;

-- 2. 更新 ID
UPDATE booking_payment_data SET id = 5 WHERE id = 8;

-- 3. 更新 Receipt Number（可选）
UPDATE booking_payment_data SET receiptno = 'RI00005' WHERE id = 5;

-- 4. 重置序列
SELECT setval(
  pg_get_serial_sequence('booking_payment_data', 'id'),
  (SELECT MAX(id) FROM booking_payment_data),
  true
);

-- 5. 检查结果
SELECT id, receiptno FROM booking_payment_data ORDER BY id;

-- 6. 如果正确，提交；否则回滚
COMMIT;
-- 或 ROLLBACK;
```

## ✅ 验证清单

修复完成后，请确认以下几点：

- [ ] ID 序列：1, 2, 3, 4, 5（连续无跳号）
- [ ] Receipt No 序列：RI00001, RI00002, RI00003, RI00004, RI00005
- [ ] 数据库序列下一个值是 6
- [ ] 所有 Payment 的其他数据（bookno, date, amount）保持不变
- [ ] 在系统中创建新 Payment，ID 为 6
- [ ] Receipt 页面显示正常

## 🎯 预期结果

### 修复前：
```
Receipt #  | ID
-----------+----
RI00001    | 1
RI00002    | 2
RI00003    | 3
RI00004    | 4
RI00008    | 8  ⬅️ 跳号
```

### 修复后：
```
Receipt #  | ID
-----------+----
RI00001    | 1
RI00002    | 2
RI00003    | 3
RI00004    | 4
RI00005    | 5  ⬅️ 已修正
下一个      | 6  ⬅️ 从 6 开始
```

## 📞 需要帮助？

如果在执行过程中遇到问题：
1. 不要慌！如果还在事务中，可以 ROLLBACK
2. 检查备份是否完整
3. 查看错误信息
4. 必要时从备份恢复数据

## ⏱️ 预计执行时间

- 备份：1-2 分钟
- 执行脚本：< 10 秒
- 验证：1-2 分钟
- **总计：约 5 分钟**

---

**最后更新：** 2026-07-08  
**执行状态：** 待执行  
**执行人：** _________________  
**执行时间：** _________________
