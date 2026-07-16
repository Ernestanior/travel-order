# Exchange Order ID 更新 - 快速指南

## 🎯 目标
为所有 Exchange Order ID 添加 'E' 前缀

## ⚡ 快速执行步骤

### 1️⃣ 备份数据库（必须！）
```bash
# 执行备份
pg_dump -U your_username -d your_database_name > backup_exchange_update.sql
```

### 2️⃣ 执行更新脚本
```bash
# 方式1: 使用命令行
psql -U your_username -d your_database_name -f UPDATE_EXCHANGE_IDS.sql

# 方式2: 复制 SQL 内容到数据库管理工具执行
# 打开 UPDATE_EXCHANGE_IDS.sql，复制所有内容，在数据库工具中执行
```

### 3️⃣ 验证结果
打开浏览器，访问 Exchange Orders 页面，检查 Exchange Number 是否都以 'E' 开头。

## ✅ 完成！

- ✅ 代码已更新：新建的 Exchange Order 自动带 'E' 前缀
- ✅ 数据库脚本已准备：`UPDATE_EXCHANGE_IDS.sql`
- ✅ 执行脚本后：所有现有 Exchange Order ID 都会添加 'E' 前缀

## 📋 示例

**更新前：**
- Exchange #: 1041741
- Exchange #: 1041744

**更新后：**
- Exchange #: E1041741
- Exchange #: E1041744

## 🔄 如果需要回滚

```sql
UPDATE "ExchangeData" SET exchangeno = SUBSTRING(exchangeno FROM 2) WHERE exchangeno LIKE 'E%';
UPDATE "ExchangeItemData" SET exchangeno = SUBSTRING(exchangeno FROM 2) WHERE exchangeno LIKE 'E%';
UPDATE "ExchangePaymentData" SET exchangeno = SUBSTRING(exchangeno FROM 2) WHERE exchangeno LIKE 'E%';
```

## ❓ 需要帮助？

详细文档请查看：`EXCHANGE_ID_PREFIX_UPDATE.md`
