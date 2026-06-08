# Exchange Order 功能实现完成

## 📋 业务逻辑说明

### Exchange Order 是什么？

Exchange Order 是**支出单**，记录你的公司向第三方供应商支付的成本费用。

### 与 Booking Order 的关系

- **Booking Order**：收入单（客户付款给你）
- **Exchange Order**：支出单（你付款给供应商）
- **关联方式**：每个 Exchange Order 必须关联到一个 Booking Order（通过 `bookno` 字段）

### 业务流程示例

```
客户订购：3天2夜泰国团

1. Booking Order (收入)
   - Booking #: 123456
   - 客户: 张三
   - 金额: $1000 (收入)

2. Exchange Order #1 (支出 - 酒店)
   - Exchange #: E001
   - 关联 Booking #: 123456
   - 供应商: 泰国某酒店
   - 金额: $500 (支出)

3. Exchange Order #2 (支出 - 机票)
   - Exchange #: E002
   - 关联 Booking #: 123456
   - 供应商: 航空公司
   - 金额: $300 (支出)

利润计算:
$1000 (收入) - $500 (酒店) - $300 (机票) = $200 (利润)
```

---

## ✅ 已实现功能

### 1. 创建 Exchange Order

**路径**: `/exchange-orders/new`

**功能流程**:

#### Step 1: 选择 Booking Order
- 搜索框输入客户名称或订单号
- 点击 "Search" 按钮搜索
- 显示匹配的 Booking Orders 列表
- 点击选择一个 Booking Order

#### Step 2: 填写 Exchange 详情
- **自动预填充信息**（从选中的 Booking 复制）:
  - Customer（客户）
  - Tour / Tour Code（旅游信息）
  - Departure/Arrival 信息（航班信息）
  - Total Amount（默认填充 Booking 的总金额）

- **需要手动填写/修改**:
  - Exchange Date（交换日期）
  - Supplier（供应商）⭐ **必填**
  - Amount（金额）⭐ **必填** - 可以修改为部分金额
  - Flight Information（可以修改）
  - Notes（备注）

- **供应商选择**:
  - 输入供应商名称搜索
  - 下拉列表显示匹配的供应商
  - 点击选择或直接输入新供应商

- 点击 "Save Exchange" 保存

**API**: `POST /api/exchange-orders/create`

**创建内容**:
1. 创建 ExchangeData 记录（主表）
2. 创建 ExchangeItemData 记录（金额作为 item）
3. 自动生成 Exchange Number

---

### 2. 查看 Exchange Order 列表

**路径**: `/exchange-orders`

**功能**:
- 显示所有 Exchange Orders
- 按供应商搜索
- 后端分页（每页50条）
- 显示字段:
  - Exchange #（交换订单号）
  - Agent/Supplier（供应商）
  - Departure/Arrival Date（出发/到达日期）
  - Total Cost（总成本）
  - Paid（已付款）
  - Outstanding（未付款）
  - Status（状态）
  - Booking #（关联的预订号）⭐

**API**: `GET /api/exchange-orders?supplier=xxx&page=1&limit=50`

---

### 3. 查看 Exchange Order 详情

**路径**: `/exchange-orders/[id]`

**显示信息**:

#### 左列
- **Exchange Information**:
  - Exchange Date（交换日期）
  - Supplier（供应商）
  - Customer（客户，从 Booking 复制）
  - Booking #（关联的预订号）

- **Items**（支付项目）:
  - Item Name（项目名称）
  - Quantity（数量）
  - Unit Price（单价）
  - Total Price（总价）
  - **Total Amount**（总金额）

- **Payments**（付款记录）:
  - Payment Date（付款日期）
  - Payment Type（付款方式）
  - Amount（金额）
  - Total Cost / Paid / Outstanding

#### 右列
- **Flight Information**（航班信息）:
  - Departure（出发）
  - Departure 2（第二段出发，如有）
  - Arrival（到达）
  - Arrival 2（第二段到达，如有）

- **Tour Information**（旅游信息）:
  - Tour Code（旅游代码）
  - Tour（旅游描述）

- **Notes**（备注）

**API**: `GET /api/exchange-orders/[id]`

---

### 4. 编辑 Exchange Order

**路径**: `/exchange-orders/[id]` - 点击 "Edit" 按钮

**可编辑字段**:
- Exchange Date（交换日期）
- Supplier（供应商）
- Items（可以添加、修改、删除 items）
- Flight Information（所有航班信息）
- Tour Information（旅游信息）
- Notes（备注）

**不可编辑**:
- Exchange Number（交换订单号）
- Booking Number（关联的预订号）
- Customer（客户）

**API**: `PUT /api/exchange-orders/[id]`

---

### 5. 删除 Exchange Order

**路径**: `/exchange-orders/[id]` - 点击 "Delete" 按钮

**删除内容**:
- ExchangePaymentData（付款记录）
- ExchangeItemData（项目）
- ExchangeData（主记录）

**确认提示**: "This action cannot be undone. All associated items and payments will be deleted."

**API**: `DELETE /api/exchange-orders/[id]`

---

## 🗄️ 数据库结构

### ExchangeData（主表）
```sql
- id: 主键
- exchangeno: Exchange 订单号（唯一）
- bookno: 关联的 Booking 订单号 ⭐ 关键字段
- exchangedate: 交换日期
- supplier: 供应商名称 ⭐ 关键字段
- status: 状态（Open/Close）
- customer: 客户（从 Booking 复制）
- bookdate: 预订日期
- deptdate/depttime/deptflt/deptdest: 出发信息
- deptdate2/depttime2/deptflt2/deptdest2: 第二段出发
- arrvdate/arrvtime/arrvflt/arrvdest: 到达信息
- arrvdate2/arrvtime2/arrvflt2/arrvdest2: 第二段到达
- tourcode/tour: 旅游信息
- special: 备注
```

### ExchangeItemData（项目表）
```sql
- exchangeno: Exchange 订单号（外键）
- item: 项目名称
- quantity: 数量
- unitprice: 单价
- price: 总价
```

### ExchangePaymentData（付款表）
```sql
- id: 主键
- exchangeno: Exchange 订单号（外键）
- receiptdate: 收据日期
- paytype: 付款方式
- amountpaid: 付款金额
- remarks: 备注
```

---

## 📁 创建的文件

### Frontend Pages
1. ✅ `app/exchange-orders/new/page.tsx` - 新建 Exchange Order 页面（双步骤流程）
2. ✅ `app/exchange-orders/[id]/page.tsx` - Exchange Order 详情/编辑页面（重写）
3. ✅ `app/exchange-orders/page.tsx` - Exchange Order 列表页面（更新按钮链接）

### Backend APIs
1. ✅ `app/api/exchange-orders/create/route.ts` - 创建 Exchange Order API
2. ✅ `app/api/exchange-orders/[id]/route.ts` - 获取/更新/删除 Exchange Order API
3. ✅ `app/api/exchange-orders/route.ts` - 列表查询 API（已存在，未修改）

---

## 🎯 使用说明

### 创建新的 Exchange Order

1. 访问 `/exchange-orders`
2. 点击右上角 "New Exchange" 按钮
3. 在搜索框输入客户名称或订单号，点击 "Search"
4. 从结果中选择一个 Booking Order
5. 系统自动填充该 Booking 的信息
6. 选择供应商（必填）
7. 修改金额（如需要，可以改为部分金额）
8. 点击 "Save Exchange"
9. 创建成功后跳转到详情页

### 查看 Exchange Order

1. 访问 `/exchange-orders`
2. 点击任意订单行
3. 查看完整详情

### 编辑 Exchange Order

1. 在详情页点击 "Edit" 按钮
2. 修改需要的字段
3. 添加/删除 Items
4. 点击 "Save" 保存
5. 或点击 "Cancel" 取消

### 删除 Exchange Order

1. 在详情页点击 "Delete" 按钮
2. 确认删除
3. 自动返回列表页

---

## 🔍 搜索功能

### Exchange Order 列表搜索
- **按供应商搜索**: 输入供应商名称，自动过滤
- **分页**: 每页显示50条记录

### 创建时搜索 Booking
- **按客户名搜索**: 搜索所有包含该客户名的 Booking Orders
- **按订单号搜索**: 精确匹配 Booking Number
- **显示前20条**: 限制搜索结果数量

---

## 💡 关键特性

### 1. 双步骤创建流程
- **Step 1**: 选择 Booking Order（必须先选择）
- **Step 2**: 填写 Exchange 详情（自动预填充）

### 2. 智能预填充
- 从选中的 Booking Order 自动复制:
  - 客户信息
  - 航班信息
  - 旅游信息
  - 默认金额

### 3. 供应商搜索
- 实时搜索供应商数据库
- 下拉列表显示匹配结果
- 支持输入新供应商

### 4. 金额灵活性
- 可以支付全部金额
- 可以修改为部分金额
- 同一个 Booking 可以创建多个 Exchange Orders

### 5. Items 管理
- 可以添加多个 items
- 自动计算总金额（数量 × 单价）
- 可以编辑、删除 items

---

## 🧪 测试步骤

### 1. 测试创建
```
1. 访问 http://localhost:3000/exchange-orders
2. 点击 "New Exchange"
3. 搜索一个存在的 Booking Order
4. 选择该订单
5. 选择供应商
6. 修改金额（如 $500）
7. 点击 "Save Exchange"
8. ✓ 应该成功创建并跳转到详情页
```

### 2. 测试查看
```
1. 在 Exchange Order 列表中点击任意订单
2. ✓ 应该显示完整的订单详情
3. ✓ 应该显示关联的 Booking #
4. ✓ 应该显示 Items 和总金额
```

### 3. 测试编辑
```
1. 在详情页点击 "Edit"
2. 修改供应商名称
3. 修改金额
4. 添加一个新 item
5. 点击 "Save"
6. ✓ 应该保存成功
7. ✓ 刷新页面，修改应该保存
```

### 4. 测试删除
```
1. 在详情页点击 "Delete"
2. 确认删除
3. ✓ 应该返回列表页
4. ✓ 该订单应该从列表中消失
```

### 5. 测试搜索
```
1. 在 Exchange Order 列表页输入供应商名称
2. ✓ 应该只显示匹配的订单
3. 清空搜索框
4. ✓ 应该显示所有订单
```

---

## 📊 数据验证

### 检查数据库
```bash
# 运行检查脚本
npx tsx scripts/check-data.ts
```

应该看到:
```
✓ Exchange Orders: 28,518
✓ Exchange Items: 50,849
✓ Exchange Payments: 57,426
```

### 测试 API
```bash
# 获取列表
curl "http://localhost:3000/api/exchange-orders?page=1&limit=5"

# 获取详情
curl "http://localhost:3000/api/exchange-orders/1"

# 创建新订单（需要有效的 booking number）
curl -X POST "http://localhost:3000/api/exchange-orders/create" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingNumber": "1043431",
    "exchangeDate": "2026-06-04",
    "supplier": "Test Supplier",
    "amount": 500,
    "customer": "Test Customer",
    "tour": "Test Tour"
  }'
```

---

## 🎉 完成状态

### ✅ 已实现
- [x] 创建 Exchange Order（双步骤流程）
- [x] 查看 Exchange Order 列表（分页）
- [x] 查看 Exchange Order 详情
- [x] 编辑 Exchange Order
- [x] 删除 Exchange Order
- [x] 按供应商搜索
- [x] 选择 Booking Order 功能
- [x] 自动预填充信息
- [x] 供应商搜索下拉
- [x] Items 管理（添加/编辑/删除）
- [x] 关联 Booking Order 显示
- [x] 所有 CRUD 操作的 API
- [x] 前端页面和 UI
- [x] 构建验证通过

### 📝 待完成（可选）
- [ ] Make Payment 功能（添加付款记录）
- [ ] 打印 Exchange Order 功能
- [ ] 导出 PDF/Excel 功能
- [ ] 批量操作功能

---

## 🔗 相关文档

- `BOOKING_CRUD_COMPLETE.md` - Booking Order CRUD 实现
- `PASSENGER_FIELDS_COMPLETE.md` - Passenger 字段实现
- `DATABASE_SYNC_COMPLETE.md` - 数据库同步说明
- `DATA_IMPORT_SUMMARY.md` - 数据导入总结

---

**实现日期**: 2026-06-04  
**状态**: ✅ 完全实现  
**功能**: Exchange Order CRUD (Create, Read, Update, Delete)
