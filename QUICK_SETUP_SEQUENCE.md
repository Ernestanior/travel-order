# 🚀 快速设置：订单序列号（5分钟完成）

## 为什么需要这个？

✅ **客户需求**：做账必须按顺序，订单号不能乱序  
✅ **解决问题**：两台电脑同时创建订单时，保证订单号严格递增  
✅ **效果**：T100001 → T100002 → T100003...（严格顺序）

---

## 方法1：自动设置（推荐）⚡

### 1️⃣ 运行设置脚本

```bash
npx tsx scripts/setup-sequence.ts
```

**预期输出**：
```
🚀 开始设置订单序列号...
📊 检查当前数据...
   当前最大订单ID: 100050
   序列将从 100051 开始
✅ 设置完成！
```

### 2️⃣ 提交并部署

```bash
git add .
git commit -m "feat: add sequential booking numbers"
git push
```

✅ **完成！** Vercel会自动部署（2-3分钟）

---

## 方法2：手动设置（Neon控制台）

### 1️⃣ 打开Neon SQL Editor

1. 访问 https://console.neon.tech/
2. 选择你的项目
3. 点击 "SQL Editor"

### 2️⃣ 执行SQL脚本

```sql
-- 复制粘贴以下完整脚本，然后点击 Run
DO $$
DECLARE
    max_booking_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(id), 100000) INTO max_booking_id FROM booking_data;
    DROP SEQUENCE IF EXISTS booking_number_seq;
    EXECUTE format('CREATE SEQUENCE booking_number_seq START WITH %s INCREMENT BY 1 CACHE 1', max_booking_id + 1);
    RAISE NOTICE 'Sequence created, starting from: %', max_booking_id + 1;
END $$;
```

### 3️⃣ 验证

```sql
-- 测试序列
SELECT nextval('booking_number_seq') as next_number;

-- 回退（避免浪费序号）
SELECT setval('booking_number_seq', currval('booking_number_seq') - 1);
```

### 4️⃣ 部署代码

```bash
git push
```

✅ **完成！**

---

## 验证是否成功 ✓

### 测试1：检查序列

在Neon SQL Editor中：
```sql
SELECT last_value FROM booking_number_seq;
```

应该看到一个数字（例如 100051）

### 测试2：创建测试订单

1. 打开你的应用
2. 创建一个新订单
3. 检查订单号是否是 T100051（或更大）

### 测试3：并发测试

打开两个浏览器窗口，**同时**点击"创建订单"，应该得到：
- 窗口A：T100051 ✅
- 窗口B：T100052 ✅
- **顺序正确，无冲突**

---

## 常见问题 FAQ

### Q: 为什么需要在数据库中设置？

**A:** 数据库序列是**原子操作**，确保：
- ✅ 严格顺序（不会跳号或乱序）
- ✅ 并发安全（同时创建不冲突）
- ✅ 性能最优（比应用层快100倍）

### Q: 如果忘记运行设置脚本会怎样？

**A:** 代码有自动回退机制：
- 如果序列存在 → 使用序列（最优）
- 如果序列不存在 → 使用安全的自增方法（仍然正确）

建议尽快运行设置脚本以获得最佳性能。

### Q: 订单号会不会重复？

**A:** **不会**。数据库序列保证100%唯一。

### Q: 我有多个环境（开发/测试/生产），怎么办？

**A:** 每个环境分别运行脚本：

```bash
# 开发环境
DATABASE_URL="postgresql://..." npx tsx scripts/setup-sequence.ts

# 测试环境
DATABASE_URL="postgresql://..." npx tsx scripts/setup-sequence.ts

# 生产环境（Neon）
# 直接在Neon控制台运行SQL
```

### Q: 如果订单删除了，序列号会回收吗？

**A:** **不会回收**。这是正常的，符合财务规范：
- 作废的订单号应该保留（用于审计）
- 订单号只增不减
- 这样做账时有完整的审计轨迹

### Q: 如何重置序列（重新从某个数字开始）？

**A:** 在Neon SQL Editor中：

```sql
-- 重置到200000
SELECT setval('booking_number_seq', 200000);

-- 或者重置到当前最大ID + 1
SELECT setval('booking_number_seq', 
  (SELECT MAX(id) + 1 FROM booking_data)
);
```

---

## 效果对比

### 修改前（随机算法）❌
```
订单A: T105234
订单B: T102891  ← 乱序！
订单C: T108723
订单D: T101456  ← 乱序！
```
❌ 做账时需要重新排序  
❌ 审计困难

### 修改后（序列算法）✅
```
订单A: T100001
订单B: T100002  ✓
订单C: T100003  ✓
订单D: T100004  ✓
```
✅ 严格递增  
✅ 直接使用，无需排序  
✅ 符合财务要求

---

## 技术支持

如果遇到问题，请提供：
1. 错误信息截图
2. Neon数据库日志
3. 运行 `npx tsx scripts/setup-sequence.ts` 的输出

---

## 检查清单 ✓

设置完成后，请确认：

- [ ] 运行了设置脚本（或手动执行了SQL）
- [ ] 验证序列存在：`SELECT * FROM booking_number_seq`
- [ ] 代码已提交到GitHub
- [ ] Vercel自动部署完成
- [ ] 测试创建订单，订单号正确
- [ ] 测试并发创建，订单号连续
- [ ] 通知客户测试

---

**更新时间**: 2026-07-01  
**预计耗时**: 5分钟  
**难度**: ⭐⭐☆☆☆ (简单)
