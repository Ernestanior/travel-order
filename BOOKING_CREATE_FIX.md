# Booking 创建功能修复报告

## 修复时间
2026-06-08

---

## 问题 1: 订单号重复错误 ❌

### 错误信息:
```
Unique constraint failed on the fields: (`bookno`)
```

### 原因:
- 原来的逻辑使用 `findFirst` 查询最后插入的订单
- 但订单号不是严格递增的（例如：1043494, 1043493, 1043492 同时存在）
- 导致生成重复的订单号

### 解决方案: ✅
1. **使用 SQL 查询最大值**:
   ```typescript
   const maxBookingNumber = await prisma.$queryRaw`
     SELECT MAX(CAST(bookno AS INTEGER)) as max_bookno 
     FROM booking_data 
     WHERE bookno ~ '^[0-9]+$'
   `
   ```

2. **从最大值 +1 生成**:
   - 查询到的最大订单号: `1043494`
   - 下一个订单号: `1043495`

3. **重试机制防并发**:
   - 如果 1043495 已存在，尝试 1043496
   - 最多重试 10 次

---

## 问题 2: 客户外键约束错误 ❌

### 错误信息:
```
Foreign key constraint violated: `booking_data_customer_fkey (index)`
```

### 原因:
- `BookingData` 表的 `customer` 字段有外键约束，必须引用 `Customer` 表中已存在的客户
- 创建订单时直接使用客户名称，但该客户可能不存在于数据库中

### 解决方案: ✅
在创建订单前，先检查并创建客户：

```typescript
// 1. 验证必填字段
if (!customerName) {
  throw new Error('客户名称不能为空')
}

if (!customerTel) {
  throw new Error('客户电话不能为空')
}

// 2. 检查客户是否存在
const existingCustomer = await prisma.customer.findUnique({
  where: { customer: customerName }
})

// 3. 如果不存在则创建
if (!existingCustomer) {
  await prisma.customer.create({
    data: {
      customer: customerName,
      tel: customerTel,
      address: body.address || null,
      fax: body.fax || null
    }
  })
}

// 4. 然后创建订单
const booking = await prisma.bookingData.create({
  data: {
    bookno: newBookingNumber,
    customer: customerName,
    // ... 其他字段
  }
})
```

---

## 数据库约束说明

### Customer 表结构:
```prisma
model Customer {
  customer  String   @id              // 主键：客户名称
  tel       String                    // 必填：电话
  address   String?                   // 可选：地址
  fax       String?                   // 可选：传真
  
  @@unique([customer, tel])           // 唯一约束：客户名 + 电话
}
```

### BookingData 表结构:
```prisma
model BookingData {
  id         Int      @id
  bookno     String   @unique         // 唯一约束：订单号
  customer   String                   // 外键：关联到 Customer.customer
  // ...
  
  customerData Customer? @relation(fields: [customer], references: [customer])
}
```

---

## 修复后的流程

### 创建新订单的完整流程:
1. ✅ 查询数据库中最大的订单号
2. ✅ 生成新订单号 = 最大订单号 + 1
3. ✅ 检查订单号是否已存在（重试机制）
4. ✅ 验证客户名称和电话不为空
5. ✅ 检查客户是否存在
6. ✅ 如果客户不存在，先创建客户记录
7. ✅ 创建订单
8. ✅ 创建乘客信息
9. ✅ 创建订单项目

---

## 测试建议

### 测试场景 1: 新客户创建订单
1. 填写一个从未使用过的客户名称
2. 填写客户电话（必填）
3. 填写其他订单信息
4. 点击保存
5. **预期结果**: 
   - 自动创建客户记录
   - 创建订单成功
   - 订单号自动递增

### 测试场景 2: 已有客户创建订单
1. 填写一个已存在的客户名称
2. 填写客户电话
3. 填写其他订单信息
4. 点击保存
5. **预期结果**: 
   - 使用现有客户记录
   - 创建订单成功
   - 订单号自动递增

### 测试场景 3: 空客户名称
1. 留空客户名称
2. 点击保存
3. **预期结果**: 
   - 显示错误: "客户名称不能为空"

### 测试场景 4: 空电话号码
1. 填写客户名称
2. 留空电话号码
3. 点击保存
4. **预期结果**: 
   - 显示错误: "客户电话不能为空"

---

## 文件变更

- ✅ `app/api/booking-orders/create/route.ts` - 修复订单号生成和客户创建逻辑

---

## 注意事项

1. **客户名称和电话是必填项** - 前端表单应该设置为 required
2. **订单号自动生成** - 用户无需手动输入
3. **客户自动创建** - 如果是新客户，系统会自动创建记录
4. **并发安全** - 使用重试机制处理并发创建订单的情况

---

**修复完成！** 🎉

现在可以正常创建订单了。记得在前端表单中将客户名称和电话设置为必填项（required）。
