# Exchange Order ID 添加 'E' 前缀

## 问题说明

Exchange Order 的 ID 没有统一的前缀，需要添加 'E' 前缀以便识别。

**对比：**
- Booking Order Items: T 开头 (例如：T100023)
- Payment Receipt: R 开头 (例如：R100011)
- Exchange Order: **需要 E 开头** (例如：E1041741)

## 已完成的修改

### 1. ✅ 更新创建新 Exchange Order 的代码

**文件：** `/app/api/exchange-orders/create/route.ts`

**修改：**
```typescript
// 之前：
newExchangeNumber = `1${nextNumber + attempts}`

// 现在：
newExchangeNumber = `E1${nextNumber + attempts}`  // 添加 'E' 前缀
```

从现在开始，所有新创建的 Exchange Order 都会自动以 'E' 开头。

### 2. ✅ 创建数据库更新脚本

**文件：** `UPDATE_EXCHANGE_IDS.sql`

此脚本会更新数据库中所有现有的 Exchange Order ID，在前面添加 'E' 前缀。

## 🚨 执行数据库更新步骤

### 步骤 1: 备份数据库（重要！）

在执行更新前，请先备份数据库：

```bash
# PostgreSQL 备份命令示例
pg_dump -U your_username -d your_database_name > backup_before_exchange_prefix.sql
```

### 步骤 2: 执行 SQL 更新脚本

有两种方式执行：

#### 方式 A: 使用 psql 命令行

```bash
psql -U your_username -d your_database_name -f UPDATE_EXCHANGE_IDS.sql
```

#### 方式 B: 使用数据库管理工具

1. 打开您的数据库管理工具（如 pgAdmin、DBeaver 等）
2. 连接到数据库
3. 打开 `UPDATE_EXCHANGE_IDS.sql` 文件
4. 执行整个脚本

### 步骤 3: 验证更新结果

执行脚本后，会自动显示验证结果：

```
table_name              | count
------------------------+-------
ExchangeData           | X
ExchangeItemData       | Y
ExchangePaymentData    | Z
```

这显示每个表中有多少条记录的 ID 已经以 'E' 开头。

### 步骤 4: 手动检查几条记录

```sql
-- 查看 Exchange Order
SELECT id, exchangeno FROM "ExchangeData" LIMIT 5;

-- 应该看到类似：
-- id | exchangeno
-- ---+-----------
--  1 | E1041741
--  2 | E1041744
```

## SQL 脚本详细说明

脚本会更新以下 3 个表：

1. **ExchangeData** - Exchange Order 主表
2. **ExchangeItemData** - Exchange Order Items 表
3. **ExchangePaymentData** - Exchange Order Payments 表

**安全特性：**
- 使用 `WHERE exchangeno NOT LIKE 'E%'` 条件，确保不会重复添加前缀
- 如果 ID 已经以 'E' 开头，则跳过该记录

## 更新影响范围

### 会更新的数据：

✅ 数据库中所有 Exchange Order 相关的 ID  
✅ 新创建的 Exchange Order 会自动带 'E' 前缀

### 不需要修改的代码：

✅ 显示 Exchange Order 的页面 - 直接从数据库读取  
✅ API 路由 - 直接查询数据库  
✅ PDF 生成 - 使用传入的数据

### 示例变化：

**之前：**
- Exchange Number: `1041741`
- Exchange Number: `1041744`

**之后：**
- Exchange Number: `E1041741`
- Exchange Number: `E1041744`

## 测试建议

### 1. 创建新 Exchange Order
- 创建一个新的 Exchange Order
- 确认 Exchange Number 以 'E' 开头 (例如：E1041750)

### 2. 查看现有 Exchange Order
- 打开 Exchange Orders 列表页面
- 确认所有 Exchange Number 都以 'E' 开头

### 3. 导出 Exchange Invoice PDF
- 选择一个 Exchange Order
- 导出 PDF
- 确认 PDF 中显示 "Exchange #: E1041741"

### 4. 搜索功能
- 尝试搜索 Exchange Number (例如：E1041741)
- 确认能正常搜索到结果

## 回滚方案

如果需要回滚更新：

```sql
-- 移除 'E' 前缀
UPDATE "ExchangeData"
SET exchangeno = SUBSTRING(exchangeno FROM 2)
WHERE exchangeno LIKE 'E%';

UPDATE "ExchangeItemData"
SET exchangeno = SUBSTRING(exchangeno FROM 2)
WHERE exchangeno LIKE 'E%';

UPDATE "ExchangePaymentData"
SET exchangeno = SUBSTRING(exchangeno FROM 2)
WHERE exchangeno LIKE 'E%';
```

## 常见问题

**Q: 执行脚本需要多久？**  
A: 取决于数据量，通常几秒到几分钟。如果有几千条记录，可能需要 1-2 分钟。

**Q: 会影响正在使用的系统吗？**  
A: 建议在低峰时段执行。更新过程中，相关表会被锁定。

**Q: 如果执行中途出错怎么办？**  
A: 使用备份恢复数据库，然后检查错误原因。

**Q: 新旧 ID 格式会冲突吗？**  
A: 不会。旧格式如 `1041741`，新格式如 `E1041741`，完全不同。

## 完成清单

- [ ] 1. 备份数据库
- [ ] 2. 执行 `UPDATE_EXCHANGE_IDS.sql` 脚本
- [ ] 3. 验证更新结果（检查几条记录）
- [ ] 4. 测试创建新 Exchange Order
- [ ] 5. 测试查看现有 Exchange Orders
- [ ] 6. 测试搜索功能
- [ ] 7. 测试导出 PDF 功能

## 技术支持

如果遇到问题，请提供：
1. 错误信息截图
2. 数据库版本
3. 受影响的记录数量

---

**最后更新：** 2026-07-16  
**修改人员：** Kiro AI Assistant
