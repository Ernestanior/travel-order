# Customer Email 和 Address 保存问题修复

## 问题描述
在创建或编辑 Booking Order 时，填写的 Email 和 Address 没有正确保存到 Customer 记录中。

## 根本原因

### 创建 Booking Order (create/route.ts)
1. **Email 问题**：只在客户已存在且 email 不同时才更新，导致很多情况下 email 不会被保存
2. **Address 问题**：完全没有更新现有客户的 address

### 编辑 Booking Order ([id]/route.ts)
1. 使用 `body.email || null` 可能会将空字符串转为 null，覆盖现有数据

## 修复方案

### 1. 创建 Booking Order API
**文件**: `/app/api/booking-orders/create/route.ts`

**修复前**：
```typescript
if (!existingCustomer) {
  // 创建新客户
  await prisma.customer.create({ ... })
} else if (body.email && existingCustomer.email !== body.email) {
  // 只更新 email
  await prisma.customer.update({ ... })
}
```

**修复后**：
```typescript
if (!existingCustomer) {
  // 创建新客户
  await prisma.customer.create({ ... })
} else {
  // 客户已存在，更新所有提供的信息
  const updateData: any = {}
  
  if (body.email && existingCustomer.email !== body.email) {
    updateData.email = body.email
  }
  
  if (body.address && existingCustomer.address !== body.address) {
    updateData.address = body.address
  }
  
  if (customerTel && existingCustomer.tel !== customerTel) {
    updateData.tel = customerTel
  }
  
  if (Object.keys(updateData).length > 0) {
    await prisma.customer.update({
      where: { customer: customerName },
      data: updateData
    })
  }
}
```

### 2. 编辑 Booking Order API
**文件**: `/app/api/booking-orders/[id]/route.ts`

**修复前**：
```typescript
await prisma.customer.upsert({
  where: { customer: body.customerName },
  update: {
    address: body.address || null,  // 可能将空字符串转为 null
    tel: body.tel,
    email: body.email || null,      // 可能将空字符串转为 null
  },
  create: { ... }
})
```

**修复后**：
```typescript
const existingCustomer = await prisma.customer.findUnique({
  where: { customer: body.customerName }
})

if (existingCustomer) {
  // 只更新提供了有效值的字段
  const updateData: any = { tel: body.tel }
  
  if (body.address !== undefined && body.address !== '') {
    updateData.address = body.address
  }
  
  if (body.email !== undefined && body.email !== '') {
    updateData.email = body.email
  }
  
  await prisma.customer.update({
    where: { customer: body.customerName },
    data: updateData
  })
} else {
  // 创建新客户
  await prisma.customer.create({ ... })
}
```

## 修复内容总结

### ✅ 创建 Booking Order
- 现在会正确更新现有客户的 **email**
- 现在会正确更新现有客户的 **address**
- 现在会正确更新现有客户的 **tel**

### ✅ 编辑 Booking Order
- 改用更安全的逻辑，只更新提供了有效值的字段
- 避免空字符串覆盖现有数据

## 测试步骤

### 测试 1：创建新客户
1. 创建新的 Booking Order
2. 输入新客户名称、Email、Address
3. 保存后，检查 Customers 列表
4. ✅ 验证 Email 和 Address 已保存

### 测试 2：更新现有客户
1. 创建 Booking Order，选择已存在的客户
2. 修改 Email 或 Address
3. 保存后，检查 Customers 列表
4. ✅ 验证新的 Email 和 Address 已更新

### 测试 3：编辑订单
1. 编辑现有的 Booking Order
2. 修改客户的 Email 或 Address
3. 保存后，检查 Customers 列表
4. ✅ 验证信息已更新

### 测试 4：空值处理
1. 编辑 Booking Order，不填写 Email
2. 保存
3. ✅ 验证原有的 Email 没有被清空

## 注意事项

1. **更新逻辑**：只在提供了新值且不同于现有值时才更新
2. **空值保护**：空字符串不会覆盖现有数据
3. **Tel 字段**：Tel 是必填字段，总是会被更新
4. **向后兼容**：修复不影响现有数据

---

**修复完成时间**: 2026-06-30
**影响文件**: 
- `/app/api/booking-orders/create/route.ts`
- `/app/api/booking-orders/[id]/route.ts`
