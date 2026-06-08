# Booking Order 改进完成报告

## 完成时间
2026-06-08

---

## ✅ 已完成的改进

### 1. 增强验证 - 不能空白保存

#### Passenger 验证:
- ✅ 至少需要 1 个乘客
- ✅ 每个乘客必须填写 Name（必填）
- ✅ Passport 和 Birth Date 为可选
- ✅ Name 字段标记为必填（红色星号）

#### Tour Information 验证:
- ✅ 必须填写 Tour Code 或 Tour Description 中的至少一个
- ✅ 标题显示 "(At least one required)"
- ✅ 保存时会验证

#### 验证错误提示:
```typescript
// Passenger name required
"All passengers must have a name"

// Tour info required
"Please fill in Tour Code or Tour Description"
```

---

### 2. 添加 Email Address 字段

#### 数据库更新:
```prisma
model Customer {
  customer  String   @id
  address   String?
  tel       String
  fax       String?
  email     String?  // ✅ 新增字段
  ...
}
```

#### UI 更新:
- ✅ 在 Customer Information 部分添加 Email 输入框
- ✅ 邮箱格式验证（type="email"）
- ✅ 可选字段

#### 后端更新:
- ✅ 创建新客户时保存 email
- ✅ 如果客户已存在但 email 不同，自动更新 email
- ✅ Customers API 返回 email 字段

---

### 3. Customer Name 可以选择已有客户

#### 功能特性:
- ✅ 输入客户名称时自动搜索（2个字符后触发）
- ✅ 显示下拉列表，包含：
  - 客户名称
  - 电话号码
  - Email（如果有）
- ✅ 点击选择客户后，自动填充：
  - Customer Name
  - Tel / HP
  - Address
  - Fax
  - Email
- ✅ 也可以输入新客户名称（不在列表中）

#### 使用场景:
**场景 1: 选择已有客户**
1. 在 Customer Name 输入框输入客户名称的一部分
2. 从下拉列表选择客户
3. 所有信息自动填充
4. 继续填写订单其他信息

**场景 2: 添加新客户**
1. 在 Customer Name 输入框输入新客户名称
2. 手动填写电话、地址等信息
3. 保存时自动创建客户记录

#### UI 示例:
```
Customer Name *
┌─────────────────────────────────────┐
│ ABC Travel                          │▼
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ ABC Travel Agency                   │ ← 可点击
│ Tel: 12345678 • Email: abc@test.com │
├─────────────────────────────────────┤
│ ABC Tours Pte Ltd                   │ ← 可点击
│ Tel: 87654321                       │
└─────────────────────────────────────┘
```

---

## ⏳ 待确认：Make Payment 功能

### 需求确认

我需要确认 Make Payment 功能的具体需求：

#### 问题 1: 功能位置
- [ ] 在订单详情页面添加 "Make Payment" 按钮？
- [ ] 在订单列表页面也可以直接 Make Payment？
- [ ] 还是在单独的页面？

#### 问题 2: 付款信息
需要记录哪些信息？
- [ ] 付款金额
- [ ] 付款日期
- [ ] 付款方式（现金、支票、信用卡、银行转账等）
- [ ] 支票号码（如果是支票）
- [ ] 收据号码
- [ ] 备注

#### 问题 3: 多次付款
- [ ] 可以多次付款（部分付款）？
- [ ] 显示已付金额和未付金额？
- [ ] 显示付款历史记录？

#### 问题 4: UI 设计
```
Example:
┌────────────────────────────────────────┐
│ Booking Order #1043520                 │
│                                        │
│ Total: $5000.00                        │
│ Paid:  $2000.00                        │
│ Outstanding: $3000.00                  │
│                                        │
│ [Make Payment] 按钮                    │
└────────────────────────────────────────┘

点击后弹出对话框：
┌────────────────────────────────────────┐
│ Make Payment                           │
│                                        │
│ Outstanding: $3000.00                  │
│                                        │
│ Amount: [_______]                      │
│ Payment Date: [2026-06-08]             │
│ Payment Method: [▼ Cash   ]            │
│ Cheque No: [_______] (optional)        │
│ Receipt No: [_______]                  │
│ Remarks: [_______]                     │
│                                        │
│ [Cancel]  [Save Payment]               │
└────────────────────────────────────────┘
```

#### 问题 5: 数据库
看起来已经有 `BookingPaymentData` 表：
```prisma
model BookingPaymentData {
  id          Int
  receiptno   String?
  bookno      String?
  receiptdate DateTime?
  paytype     String?      // 付款方式
  for         String?
  chequeno    String?      // 支票号
  visano      String?
  amountpaid  Decimal?
  paidtext    String?
  customer    String?
  payfor      String?
  booking     BookingData?
}
```

是否使用这个表？

---

## 数据库变更

### 已执行:
```sql
-- 添加 email 字段到 customer_data 表
ALTER TABLE customer_data 
ADD COLUMN email VARCHAR(255);
```

### 验证:
```bash
npx prisma db push
# ✅ Your database is now in sync with your Prisma schema.
```

---

## 文件变更

### 前端文件:
- ✅ `app/booking-orders/new/page.tsx`
  - 添加客户搜索功能
  - 添加 email 字段
  - 增强验证逻辑
  - 改进 UI 提示

### 后端文件:
- ✅ `app/api/booking-orders/create/route.ts`
  - 支持 email 字段
  - 自动更新客户 email
  
- ✅ `app/api/customers/route.ts`
  - 返回 email 字段

### 数据库:
- ✅ `prisma/schema.prisma`
  - Customer 模型添加 email 字段

---

## 测试建议

### 测试场景 1: 选择已有客户
1. 打开新建订单页面
2. 在 Customer Name 输入 "ABC"
3. 从下拉列表选择一个客户
4. ✅ 验证所有字段自动填充

### 测试场景 2: 添加新客户含 Email
1. 输入新客户名称
2. 填写电话、地址、email
3. 保存订单
4. ✅ 检查客户列表，新客户应该包含 email

### 测试场景 3: Passenger 验证
1. 添加一个乘客但不填 Name
2. 点击保存
3. ✅ 应显示错误 "All passengers must have a name"

### 测试场景 4: Tour 验证
1. 不填写 Tour Code 和 Tour Description
2. 点击保存
3. ✅ 应显示错误 "Please fill in Tour Code or Tour Description"

### 测试场景 5: 全部正确填写
1. 选择客户或输入新客户
2. 添加至少 1 个 item
3. 添加至少 1 个 passenger（含 name）
4. 填写 Tour Code 或 Tour Description
5. ✅ 应成功创建订单

---

## 下一步

### 需要用户确认:
1. **Make Payment 功能需求** - 请回答上面的 5 个问题
2. 确认后我会实现 Make Payment 功能

### 可选改进（低优先级）:
- [ ] 客户管理页面（可以编辑客户信息）
- [ ] 批量导入客户
- [ ] 客户搜索历史
- [ ] 最近使用的客户快速选择

---

## 完成清单

- [x] Passenger name 必填验证
- [x] Tour information 至少填一个验证
- [x] 添加 Email Address 字段
- [x] Customer Name 搜索已有客户
- [x] 自动填充客户信息
- [x] 更新数据库 schema
- [x] 后端 API 支持 email
- [ ] Make Payment 功能（待需求确认）

---

**请确认 Make Payment 功能的需求，我会立即实现！** 🚀
