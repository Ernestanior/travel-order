# Item 字段长度限制问题修复报告

## 问题描述

客户反馈：
- 在新建或修改 Booking Order 时，如果 item 名称太长会导致 **"Failed to Update Order"** 错误
- 同样的问题也影响 Exchange Orders

![错误截图](错误信息显示: "Failed to Update Order - Failed to update booking")

## 根本原因

数据库中 `item` 字段被限制为 **VARCHAR(50)**，只能存储最多 50 个字符。

```sql
-- 原来的限制
item  String  @db.VarChar(50)  -- ❌ 太短了
```

当用户输入超过 50 个字符的 item 名称时：
- PostgreSQL 会拒绝插入/更新操作
- API 返回错误
- 前端显示 "Failed to Update Order"

而且前端没有任何字符限制提示，用户可以输入任意长度的文本，直到保存时才发现问题。

## 解决方案

### 1. 增加数据库字段长度 ✅

将 `item` 字段从 VARCHAR(50) 增加到 **VARCHAR(200)**：

**修改的文件：**
- `prisma/schema.prisma`
  - `ItemData.item` - Booking Orders 的 items
  - `ExchangeItemData.item` - Exchange Orders 的 items

```prisma
// 修复后
item  String  @db.VarChar(200)  // ✅ 足够长
```

### 2. 前端添加字符限制和提示 ✅

在所有 item 输入框添加：
- `maxLength={200}` - 防止输入超过 200 个字符
- 字符计数显示 - 显示当前字符数 / 200

**修改的文件：**
- `app/booking-orders/new/page.tsx` - 新建 Booking Order
- `app/booking-orders/[id]/page.tsx` - 编辑 Booking Order
- `app/exchange-orders/new/page.tsx` - 新建 Exchange Order
- `app/exchange-orders/[id]/page.tsx` - 编辑 Exchange Order

**效果展示：**
```
┌─────────────────────────────────────────┐
│ Item Name                               │
│ ┌─────────────────────────────────────┐ │
│ │ Air Ticket - Singapore to Seoul via │ │
│ └─────────────────────────────────────┘ │
│ 35/200 characters                       │
└─────────────────────────────────────────┘
```

### 3. 数据库迁移脚本 ✅

创建了 SQL 迁移脚本：`ITEM_LENGTH_INCREASE_MIGRATION.sql`

```sql
-- 更新 booking orders 的 items
ALTER TABLE item_data 
ALTER COLUMN item TYPE VARCHAR(200);

-- 更新 exchange orders 的 items
ALTER TABLE exchange_item_data 
ALTER COLUMN item TYPE VARCHAR(200);
```

## 部署步骤

### 步骤 1: 运行数据库迁移

```bash
# 方法 1: 直接运行 SQL 脚本
psql $DATABASE_URL -f ITEM_LENGTH_INCREASE_MIGRATION.sql

# 方法 2: 或者使用 Prisma
npx prisma db push
```

### 步骤 2: 验证迁移

```sql
-- 检查字段长度是否已更新
SELECT 
    table_name, 
    column_name, 
    character_maximum_length 
FROM information_schema.columns 
WHERE table_name IN ('item_data', 'exchange_item_data') 
AND column_name = 'item';

-- 预期结果：
-- table_name            | column_name | character_maximum_length
-- ----------------------|-------------|-------------------------
-- item_data             | item        | 200
-- exchange_item_data    | item        | 200
```

### 步骤 3: 部署代码

代码修改已完成，可以直接部署到生产环境。

## 影响范围

✅ **Booking Orders**
- 新建页面 - Item 输入添加了 maxLength 和字符计数
- 编辑页面 - Item 输入添加了 maxLength 和字符计数

✅ **Exchange Orders**
- 新建页面 - Item 输入添加了 maxLength 和字符计数
- 编辑页面 - Item 输入添加了 maxLength 和字符计数

✅ **数据库**
- item_data 表 - item 字段扩展到 VARCHAR(200)
- exchange_item_data 表 - item 字段扩展到 VARCHAR(200)

## 向后兼容性

✅ **完全向后兼容**
- 扩展字段长度不会影响现有数据
- 现有的短 item 名称继续正常工作
- 只是允许更长的名称

## 测试建议

### 测试用例 1: 短名称（正常情况）
- 输入: "Air Ticket"（10 字符）
- 预期: 正常保存，显示 "10/200 characters"

### 测试用例 2: 长名称（新功能）
- 输入: "Air Ticket - Round Trip from Singapore (SIN) to Seoul Incheon (ICN) via Singapore Airlines Flight SQ123 with stopover in Bangkok including meals and baggage"（152 字符）
- 预期: 正常保存，显示 "152/200 characters"

### 测试用例 3: 最大长度
- 输入: 200 个字符的文本
- 预期: 正常保存，无法再输入更多字符

### 测试用例 4: 超过最大长度
- 尝试: 在已有 200 字符时继续输入
- 预期: 输入被阻止，maxLength 生效

## 用户体验改进

**修复前：** ❌
- 用户可以输入任意长度的文本
- 保存时才发现错误
- 错误信息不明确："Failed to update booking"
- 用户不知道原因，可能会多次尝试

**修复后：** ✅
- 输入框有 200 字符限制
- 实时显示字符计数（如 "152/200 characters"）
- 接近限制时用户可以看到
- 超过 200 字符时无法继续输入
- 保存成功

## 注意事项

1. **数据库迁移是必须的**
   - 如果只部署前端代码而不运行迁移，问题依然存在
   - 前端虽然限制了 200 字符，但数据库仍然是 50 字符限制

2. **200 字符是否足够？**
   - 分析了常见的 item 名称
   - 200 字符可以容纳非常详细的描述
   - 如果将来需要更长，可以再次扩展到 VARCHAR(500)

3. **性能影响**
   - VARCHAR 的长度不会影响存储空间（PostgreSQL 只存储实际内容）
   - 索引大小可能略微增加（但 item 不是主键）
   - 性能影响可以忽略不计

## 修复日期

2026-07-02

## 相关文件

- ✅ `prisma/schema.prisma` - 数据库模型定义
- ✅ `ITEM_LENGTH_INCREASE_MIGRATION.sql` - 数据库迁移脚本
- ✅ `app/booking-orders/new/page.tsx` - 新建 booking
- ✅ `app/booking-orders/[id]/page.tsx` - 编辑 booking
- ✅ `app/exchange-orders/new/page.tsx` - 新建 exchange
- ✅ `app/exchange-orders/[id]/page.tsx` - 编辑 exchange
