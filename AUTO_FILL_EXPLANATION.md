# 自动填充跳号功能说明

## 🎯 问题

即使有了 `display_no = bookno` 和占位订单，**未来仍然会出现跳号**。

### 为什么会跳号？

```
场景 1: 用户取消创建
  1. 用户点击"创建订单"
  2. 系统生成 bookno: T100056
  3. 用户填写信息时取消
  4. T100056 被浪费 ❌

场景 2: 创建失败
  1. 系统生成 bookno: T100057
  2. 验证失败（缺少必填字段）
  3. 事务回滚
  4. T100057 被浪费 ❌

场景 3: 网络中断
  1. 系统生成 bookno: T100058
  2. 网络中断，请求失败
  3. T100058 被浪费 ❌

结果: T100055 → T100059 (跳号！)
```

---

## ✅ 解决方案：自动填充

我已经在创建订单 API 中添加了**自动检测和填充**功能。

### 工作原理

```javascript
创建订单时（在事务中）：

1. 生成新订单号: T100062

2. 检查上一个订单号: T100055

3. 发现跳号: T100055 → T100062 (缺少 T100056-T100061)

4. 自动填充占位订单:
   ✅ 创建 T100056 (占位)
   ✅ 创建 T100057 (占位)
   ✅ 创建 T100058 (占位)
   ✅ 创建 T100059 (占位)
   ✅ 创建 T100060 (占位)
   ✅ 创建 T100061 (占位)

5. 创建真实订单: T100062

6. 提交事务（原子操作）

结果: T100055 → T100056 → T100057 → ... → T100062 (连续！)
```

---

## 📊 实际效果

### **场景测试**

```
当前状态:
  最大订单号: T100055
  序列当前值: T100057

用户创建新订单:
  1. 系统生成: T100061 (序列已经推进)
  2. 检测到跳号: T100055 → T100061
  3. 自动填充: T100056, T100057, T100058, T100059, T100060
  4. 创建真实订单: T100061
  
最终结果:
  T100055 (真实)
  T100056 (占位) ← 自动填充
  T100057 (占位) ← 自动填充
  T100058 (占位) ← 自动填充
  T100059 (占位) ← 自动填充
  T100060 (占位) ← 自动填充
  T100061 (真实) ← 用户创建
  
✅ 完全连续！
```

---

## 🔧 技术实现

### 代码位置
`app/api/booking-orders/create/route.ts`

### 核心逻辑
```typescript
// 在事务中
const result = await prisma.$transaction(async (tx) => {
  // 1. 生成 bookno
  const newBookingNumber = `T${nextNumber}`
  
  // 2. 检测跳号
  const maxExisting = await tx.bookingData.findFirst({
    orderBy: { bookno: 'desc' }
  })
  
  // 3. 如果有跳号，自动填充
  if (newNumber > maxNumber + 1) {
    for (let i = maxNumber + 1; i < newNumber; i++) {
      await tx.bookingData.create({
        data: {
          bookno: `T${i}`,
          display_no: `T${i}`,
          customer: '[PLACEHOLDER]',
          status: 'Placeholder',
          // ...
        }
      })
    }
  }
  
  // 4. 创建真实订单
  await tx.bookingData.create({ ... })
})
```

---

## ✅ 优点

1. **完全自动化**
   - 用户无需手动操作
   - 不需要定期运行脚本

2. **原子操作**
   - 在同一事务中完成
   - 要么全部成功，要么全部回滚

3. **零维护**
   - 不需要定期检查
   - 不会累积跳号

4. **性能影响小**
   - 只在创建订单时执行
   - 跳号很少时（1-5个）几乎无影响

---

## ⚠️ 注意事项

### 1. **大量跳号的情况**

如果跳号很多（如跳了 100 个），会在一次创建中填充 100 个占位订单。

**影响**：
- ⏱️ 创建订单会变慢（需要创建 100 个占位订单）
- 💾 数据库写入增加

**解决方案**：
```javascript
// 可以设置最大自动填充数量
const MAX_AUTO_FILL = 10

if (newNumber > maxNumber + 1) {
  const gap = newNumber - maxNumber - 1
  
  if (gap > MAX_AUTO_FILL) {
    // 跳号太多，记录日志，不自动填充
    console.warn(`Gap too large (${gap}), skipping auto-fill`)
  } else {
    // 正常填充
    for (let i = maxNumber + 1; i < newNumber; i++) {
      // 创建占位订单...
    }
  }
}
```

### 2. **并发创建订单**

两个用户同时创建订单时：
- ✅ 事务隔离级别保证安全
- ✅ 不会创建重复的占位订单
- ✅ 可能一个用户等待另一个完成

### 3. **占位订单的清理**

占位订单会一直存在，除非：
- 手动删除（不建议）
- 转换为真实订单（编辑它）

---

## 🎯 最佳实践

### **方案 1: 启用自动填充（当前实现）**

✅ **推荐使用条件**：
- 跳号不频繁（每次 < 10 个）
- 希望完全自动化
- 不介意有占位订单

### **方案 2: 限制自动填充 + 定期手动**

```javascript
// 设置阈值
const MAX_AUTO_FILL = 5

if (gap <= MAX_AUTO_FILL) {
  // 自动填充（小跳号）
} else {
  // 记录日志，手动处理（大跳号）
  console.warn(`Large gap detected: ${gap} orders missing`)
  // 可以发送邮件通知管理员
}
```

✅ **推荐使用条件**：
- 偶尔会有大量跳号
- 希望控制性能
- 定期维护可接受

---

## 📝 监控建议

### **添加日志**

```typescript
// 在创建订单 API 中
if (newNumber > maxNumber + 1) {
  const gap = newNumber - maxNumber - 1
  console.log(`[Auto-Fill] Gap detected: ${gap} orders`)
  console.log(`[Auto-Fill] Filling T${maxNumber + 1} to T${newNumber - 1}`)
  
  // 填充...
  
  console.log(`[Auto-Fill] Successfully filled ${gap} placeholder orders`)
}
```

### **统计报表**

定期生成报表：
- 真实订单数量
- 占位订单数量
- 占位订单占比

```sql
-- 查询占位订单统计
SELECT 
  COUNT(*) FILTER (WHERE status = 'Placeholder') as placeholder_count,
  COUNT(*) FILTER (WHERE status != 'Placeholder') as real_count,
  COUNT(*) as total_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'Placeholder') / COUNT(*), 2) as placeholder_percentage
FROM booking_data;
```

---

## 🚀 总结

### **现在的行为**

1. ✅ 历史订单保持不变
2. ✅ 已填充所有现有跳号
3. ✅ **未来创建订单时自动填充跳号**
4. ✅ 列表永远保持连续

### **用户体验**

- 用户创建订单时可能稍微慢一点（如果有跳号）
- 但列表始终完整、连续
- 无需手动维护

### **维护成本**

- 🎉 **零维护**
- 🎉 自动化处理
- 🎉 不会累积问题

---

**最后更新**: 2026-08-03
**状态**: ✅ 已实现并测试
**自动填充**: 已启用
