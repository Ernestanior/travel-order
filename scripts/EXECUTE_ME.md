# 🚀 快速修复 Payment ID 8 -> 5

## 最简单的执行方法

### 1️⃣ 备份数据库（必须！）
```bash
pg_dump -U your_username -d your_database > backup_before_fix.sql
```

### 2️⃣ 执行修复
```bash
psql -U your_username -d your_database < scripts/quick-fix-id8-to-id5.sql
```

### 3️⃣ 检查结果
在浏览器中打开 Receipt 页面，应该看到：
- RI00001, RI00002, RI00003, RI00004, RI00005 ✅
- 创建新 Payment 时会是 RI00006 ✅

---

## 如果你不知道数据库用户名和密码

查看项目的 `.env` 文件：
```bash
cat .env | grep DATABASE_URL
```

会看到类似这样的内容：
```
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

例如：
```
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/airline_db"
```

那么：
- 用户名：`myuser`
- 密码：`mypassword`
- 数据库名：`airline_db`

---

## 完整示例

假设你的数据库连接信息是：
- 用户名：`postgres`
- 数据库：`airline_order_db`

```bash
# 1. 备份
pg_dump -U postgres -d airline_order_db > backup_before_fix.sql

# 2. 执行修复
psql -U postgres -d airline_order_db < scripts/quick-fix-id8-to-id5.sql

# 3. 完成！
```

---

## 预期输出

执行时你会看到：

```
=== 修改前的数据 ===
 id | receiptno | bookno   | date       | amountpaid
----+-----------+----------+------------+-----------
  1 | RI00001   | T100015  | 02-07-2026 | 60995.00
  2 | RI00002   | T100002  | 03-07-2026 | 8829.00
  3 | RI00003   | T100010  | 06-07-2026 | 2725.00
  4 | RI00004   | T100021  | 07-07-2026 | 267.00
  8 | RI00008   | T100026  | 08-07-2026 | 4536.00

=== 开始修改... ===
UPDATE 1
UPDATE 1
 setval
--------
      5

=== 修改后的数据 ===
 id | receiptno | bookno   | date       | amountpaid
----+-----------+----------+------------+-----------
  1 | RI00001   | T100015  | 02-07-2026 | 60995.00
  2 | RI00002   | T100002  | 03-07-2026 | 8829.00
  3 | RI00003   | T100010  | 06-07-2026 | 2725.00
  4 | RI00004   | T100021  | 07-07-2026 | 267.00
  5 | RI00005   | T100026  | 08-07-2026 | 4536.00  ⬅️ 已修正

=== 序列状态 ===
  description   | value
----------------+-------
 Current Value  |     5
 Next Value     |     6  ⬅️ 下次从 6 开始

=== 修复完成！ ===
下次创建 Payment 将从 ID=6, RI00006 开始
```

---

## ⚠️ 注意事项

1. **必须先备份！** 如果出问题可以恢复
2. **确保没有人在使用系统** 修复期间最好暂停系统访问
3. **只需要执行一次** 不要重复执行

---

## 🆘 如果出错了

恢复备份：
```bash
psql -U your_username -d your_database < backup_before_fix.sql
```

然后联系技术支持。
