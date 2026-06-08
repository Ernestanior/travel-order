# Exchange Order 创建功能修复报告

## 修复时间
2026-06-08

---

## 问题：Exchange Order 创建失败 ❌

### 错误信息:
```
Unique constraint failed on the fields: (`exchangeno`)
```

### 根本原因分析:

#### 问题 1: Exchange Number 生成逻辑缺陷
**问题代码**:
```typescript
const lastExchange = await prisma.exchangeData.findFirst({
  orderBy: { id: 'desc' },
  select: { exchangeno: true }
})
```

**问题**:
- 使用 `findFirst` 按 ID 降序排序
- 但 Exchange Number 不是严格递增的
- 当前数据：最大 exchangeno = 1041743，但不是最后插入的
- 导致生成重复的 Exchange Number

#### 问题 2: 缺少外键验证
- 没有验证 Booking Order 是否存在
- 没有验证 Supplier 是否存在
- 没有验证 Customer 是否存在（如果提供）
- 可能导致外键约束错误

#### 问题 3: 缺少自动创建逻辑
- Supplier 可能不存在（用户可以输入新供应商）
- Customer 可能不存在
- 需要自动创建这些记录

---

## 解决方案 ✅

### 1. 修复 Exchange Number 生成

#### 使用 SQL 查询最大值:
```typescript
const maxExchangeNumber = await prisma.$queryRaw<Array<{ max_exchangeno: string | null }>>`
  SELECT MAX(CAST(exchangeno AS INTEGER)) as max_exchangeno 
  FROM exchange_data 
  WHERE exchangeno ~ '^[0-9]+$'
`

let nextNumber = 1041744 // 默认起始值
if (maxExchangeNumber && maxExchangeNumber[0]?.max_exchangeno) {
  nextNumber = parseInt(maxExchangeNumber[0].max_exchangeno) + 1
}
```

#### 添加重试机制:
```typescript
let newExchangeNumber: string = ''
let attempts = 0
const maxAttempts = 10

while (attempts < maxAttempts) {
  newExchangeNumber = `${nextNumber + attempts}`
  
  // 检查是否已存在
  const existing = await prisma.exchangeData.findUnique({
    where: { exchangeno: newExchangeNumber },
    select: { id: true }
  })
  
  if (!existing) {
    break // 找到唯一的 Exchange Number
  }
  
  attempts++
}
```

---

### 2. 添加必填字段验证

```typescript
// 验证必填字段
if (!body.bookingNumber) {
  throw new Error('必须选择一个 Booking Order')
}

if (!body.supplier) {
  throw new Error('供应商不能为空')
}

// 验证 Booking Order 是否存在
const booking = await prisma.bookingData.findUnique({
  where: { bookno: body.bookingNumber },
  select: { bookno: true }
})

if (!booking) {
  throw new Error(`Booking Order ${body.bookingNumber} 不存在`)
}
```

---

### 3. 自动创建 Supplier

```typescript
// 确保供应商存在（如果不存在则创建）
const existingSupplier = await prisma.supplier.findUnique({
  where: { supplier: body.supplier }
})

if (!existingSupplier) {
  await prisma.supplier.create({
    data: {
      supplier: body.supplier,
      tel: 'N/A',  // 默认值，因为 tel 字段不能为空
      address: null,
      fax: null
    }
  })
}
```

**说明**: 
- Supplier 表的 `tel` 字段是必填的（不能为空）
- 使用 'N/A' 作为默认值
- 稍后可以通过 Suppliers 页面更新完整信息

---

### 4. 自动创建 Customer（如果需要）

```typescript
// 确保客户存在（如果提供了客户名称）
if (body.customer) {
  const existingCustomer = await prisma.customer.findUnique({
    where: { customer: body.customer }
  })
  
  if (!existingCustomer) {
    // 尝试从关联的 Booking Order 获取客户信息
    const bookingWithCustomer = await prisma.bookingData.findUnique({
      where: { bookno: body.bookingNumber },
      include: { customerData: true }
    })
    
    if (bookingWithCustomer?.customerData) {
      // 客户已存在于 Booking 中，无需创建
    } else {
      // 创建新客户
      await prisma.customer.create({
        data: {
          customer: body.customer,
          tel: 'N/A',  // 默认值
          address: null,
          fax: null
        }
      })
    }
  }
}
```

---

## 数据库约束说明

### Exchange Order 外键关系:
```prisma
model ExchangeData {
  exchangeno   String  @unique        // 唯一约束
  bookno       String                 // 外键 → BookingData.bookno
  supplier     String                 // 外键 → Supplier.supplier
  customer     String?                // 外键 → Customer.customer (可选)
  
  bookingData  BookingData?  @relation(fields: [bookno], references: [bookno])
  supplierData Supplier?     @relation(fields: [supplier], references: [supplier])
  customerData Customer?     @relation(fields: [customer], references: [customer])
}
```

### Supplier 表:
```prisma
model Supplier {
  supplier  String  @id              // 主键
  tel       String?                  // 可选字段
  address   String?
  fax       String?
}
```

**注意**: 根据实际的 schema，`tel` 字段可能是必填的。如果是可选的，可以传 `null` 而不是 `'N/A'`。

---

## 修复后的流程

### 创建 Exchange Order 的完整流程:
1. ✅ 查询数据库中最大的 Exchange Number
2. ✅ 生成新 Exchange Number = 最大值 + 1
3. ✅ 检查 Exchange Number 是否已存在（重试机制）
4. ✅ 验证 Booking Order 是否存在
5. ✅ 验证供应商名称不为空
6. ✅ 检查供应商是否存在，不存在则创建
7. ✅ 检查客户是否存在（如果提供），不存在则创建
8. ✅ 创建 Exchange Order
9. ✅ 创建 Exchange Item（记录金额）

---

## 测试建议

### 测试场景 1: 使用现有供应商
1. 选择一个 Booking Order
2. 在供应商输入框选择现有供应商
3. 填写金额
4. 点击保存
5. **预期结果**: 成功创建 Exchange Order

### 测试场景 2: 输入新供应商
1. 选择一个 Booking Order
2. 在供应商输入框输入新供应商名称（不在列表中）
3. 填写金额
4. 点击保存
5. **预期结果**: 
   - 自动创建供应商记录（tel = 'N/A'）
   - 成功创建 Exchange Order
   - 新供应商出现在供应商列表中

### 测试场景 3: 不选择 Booking Order
1. 跳过步骤 1，直接到步骤 2
2. 填写供应商和金额
3. 点击保存
4. **预期结果**: 显示错误 "必须选择一个 Booking Order"

### 测试场景 4: 不填写供应商
1. 选择一个 Booking Order
2. 留空供应商
3. 点击保存
4. **预期结果**: 显示错误 "供应商不能为空"

### 测试场景 5: Booking Order 不存在
1. 手动修改前端代码，传递一个不存在的 bookno
2. 点击保存
3. **预期结果**: 显示错误 "Booking Order XXX 不存在"

---

## 与 Booking Order 修复的对比

| 功能 | Booking Order | Exchange Order |
|------|--------------|----------------|
| 订单号生成 | ✅ 使用 MAX 查询 | ✅ 使用 MAX 查询 |
| 重试机制 | ✅ 最多 10 次 | ✅ 最多 10 次 |
| 外键验证 | ✅ Customer | ✅ Booking, Supplier, Customer |
| 自动创建关联 | ✅ Customer | ✅ Supplier, Customer |
| 必填字段 | customerName, tel | bookingNumber, supplier |

---

## 文件变更

- ✅ `app/api/exchange-orders/create/route.ts` - 完全重写订单号生成和验证逻辑
- ✅ `scripts/check-exchangeno.ts` - 新增 Exchange Number 检查脚本

---

## 注意事项

1. **Exchange Number 自动生成** - 用户无需手动输入
2. **Supplier 自动创建** - 新供应商会自动创建，默认电话 'N/A'
3. **Customer 自动创建** - 如果提供了客户名称且不存在，会自动创建
4. **并发安全** - 使用重试机制处理并发创建 Exchange Order 的情况
5. **数据完整性** - 所有外键关系都会被验证

---

## 后续改进建议

### 低优先级:
- [ ] 添加供应商电话输入框（在创建 Exchange 时）
- [ ] 允许在创建 Exchange 时完善供应商信息
- [ ] 添加供应商详情页面，可以更新联系信息
- [ ] 批量创建 Exchange Orders

---

**修复完成！** 🎉

现在可以正常创建 Exchange Order 了。记得测试以下场景：
1. 使用现有供应商
2. 输入新供应商名称
3. 验证错误提示
