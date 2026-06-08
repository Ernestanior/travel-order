# Booking Order CRUD 实现进度

## 📋 需求概述

实现 Booking Order 的完整增删改查功能，包括：
- 新建订单（New Booking）
- 查看订单详情
- 编辑订单信息
- 删除订单
- 添加/编辑/删除 Items（费用项目）
- 添加/删除 Passengers（乘客）
- 添加 Payment（付款记录）

---

## ✅ 已完成的部分

### 1. API Endpoints（后端）

#### ✅ 订单主 CRUD
- `GET /api/booking-orders/[id]` - 获取订单详情
- `PUT /api/booking-orders/[id]` - 更新订单
- `DELETE /api/booking-orders/[id]` - 删除订单
- `POST /api/booking-orders/create` - 创建新订单

#### ✅ Items 管理
- `POST /api/booking-orders/[id]/items` - 添加 item
- `DELETE /api/booking-orders/[id]/items?bookno=xxx&item=xxx` - 删除 item

#### ✅ Passengers 管理
- `POST /api/booking-orders/[id]/passengers` - 添加乘客
- `DELETE /api/booking-orders/[id]/passengers?bookno=xxx&paxname=xxx` - 删除乘客

#### ✅ Payments 管理
- `POST /api/booking-orders/[id]/payments` - 添加付款记录

---

## 🚧 待实现的部分

### 2. 前端页面

#### 需要实现的组件：

1. **订单详情/编辑页面** (`/app/booking-orders/[id]/page.tsx`)
   - [ ] 编辑模式切换
   - [ ] 表单字段绑定
   - [ ] 保存功能
   - [ ] 取消编辑
   
2. **新建订单页面** (`/app/booking-orders/new/page.tsx`)
   - [ ] 创建空白表单
   - [ ] 自动生成 Booking Number
   - [ ] 提交新订单

3. **Items 管理组件**
   - [ ] 显示 items 列表
   - [ ] 添加新 item 弹窗
   - [ ] 编辑 item
   - [ ] 删除 item
   - [ ] 自动计算总金额

4. **Passengers 管理组件**
   - [ ] 显示乘客列表
   - [ ] 添加乘客
   - [ ] 删除乘客

5. **Payment Modal（付款弹窗）**
   - [ ] 弹窗UI设计
   - [ ] 自动填充字段（date, amount, customer, tour）
   - [ ] Payment Type 下拉选择（Cash, Cheque, Visa, Nets, GIRO）
   - [ ] For 下拉选择（Deposit, Balance1, Balance2, Full, Overpaid）
   - [ ] 提交付款记录

6. **Delete Confirmation（删除确认）**
   - [ ] 删除订单确认弹窗
   - [ ] 删除后跳转到列表

---

## 📊 表单字段映射

### 主表单字段（BookingData）

| 界面字段 | 数据库字段 | 类型 | 必填 |
|---------|-----------|------|------|
| Booking # | bookno | string | ✅ |
| Date | bookdate | date | ✅ |
| Customer | customer | string | ✅ |
| Address | address | string | ❌ |
| Tel/HP | tel | string | ✅ |
| Fax | fax | string | ❌ |
| Discount | discount | decimal | ❌ |
| Staff | staff | string | ❌ |
| Tour Code | tourcode | string | ❌ |
| Tour | tour | string | ❌ |
| Departure Date | deptdate | date | ❌ |
| Departure Time | depttime | string | ❌ |
| Departure Flight | deptflt | string | ❌ |
| Departure Dest | deptdest | string | ❌ |
| Depart2 Date | deptdate2 | date | ❌ |
| Depart2 Time | depttime2 | string | ❌ |
| Depart2 Flight | deptflt2 | string | ❌ |
| Depart2 Dest | deptdest2 | string | ❌ |
| Arrival Date | arrvdate | date | ❌ |
| Arrival Time | arrvtime | string | ❌ |
| Arrival Flight | arrvflt | string | ❌ |
| Arrival Dest | arrvdest | string | ❌ |
| Arrival2 Date | arrvdate2 | date | ❌ |
| Arrival2 Time | arrvtime2 | string | ❌ |
| Arrival2 Flight | arrvflt2 | string | ❌ |
| Arrival2 Dest | arrvdest2 | string | ❌ |
| Special Instruction | special | string | ❌ |
| Status | status | string | ❌ |

### Items（ItemData）

| 界面字段 | 数据库字段 | 说明 |
|---------|-----------|------|
| Item | item | 项目名称（如 Air Ticket, Airport Tax） |
| Qty | quantity | 数量 |
| Unit Price | unitprice | 单价 |
| Total | price | 总价（qty * unitPrice） |

**常见 Items**:
- Air Ticket
- Airport Tax
- Hotel
- Insurance
- Visa Fee
- Tour Guide Fee

### Passengers（PassengerData）

| 界面字段 | 数据库字段 | 说明 |
|---------|-----------|------|
| Name | paxname | 乘客姓名 |
| Passport | passport | 护照号（可选） |

### Payments（BookingPaymentData）

| 界面字段 | 数据库字段 | 说明 |
|---------|-----------|------|
| Receipt # | receiptno | 自动生成 |
| Receipt Date | receiptdate | 默认今天 |
| Amount | - | 自动填充总金额（显示用） |
| Receive From | customer | 自动填充客户名 |
| Payment of | payfor | 自动填充 tour |
| Payment Type | paytype | Cash/Cheque/Visa/Nets/GIRO |
| For | for | Deposit/Balance1/Balance2/Full/Overpaid |
| Amount Paid | amountpaid | 实际付款金额 |
| Cheque No | chequeno | 支票号（如选 Cheque） |
| Visa No | visano | 信用卡号（如选 Visa） |
| Discount | - | 折扣（可选） |

---

## 🎯 下一步计划

1. ✅ 创建所有 API endpoints
2. ⏭ 实现详情页编辑功能
3. ⏭ 实现新建订单页面
4. ⏭ 实现 Items 管理
5. ⏭ 实现 Passengers 管理
6. ⏭ 实现 Payment 弹窗
7. ⏭ 实现删除功能
8. ⏭ 测试所有功能
9. ⏭ 优化用户体验

---

## 💡 技术要点

### 数据验证
- Customer, Tel 是必填项
- Booking Number 自动生成
- Item 的 price 应该等于 quantity * unitPrice
- Payment 的 Receipt Number 自动生成

### 用户体验
- 编辑时显示 Save/Cancel 按钮
- 删除前需要确认
- 添加 item/passenger 时使用弹窗或内联表单
- Payment 使用独立弹窗
- 表单验证提示
- 加载状态显示

### 安全性
- API 需要验证数据完整性
- 删除操作需要级联删除相关数据
- 日期格式统一处理

---

## 📝 注意事项

1. **日期格式**: 前端显示 DD/MM/YYYY，传给后端时转为 YYYY-MM-DD
2. **时间格式**: 存储为字符串，格式 "HHMM/HHMM"（如 "0900/1525"）
3. **金额计算**: Items 总和 = Total Cost，Total Cost - Paid = Outstanding
4. **乘客输入**: 支持"MICHEAL TOO X 23 PAX"格式，表示23个同名乘客
5. **Receipt Number**: 自动生成，不可手动修改

---

## 🧪 测试清单

- [ ] 创建新订单
- [ ] 编辑现有订单
- [ ] 添加 Items 并验证总金额计算
- [ ] 添加多个 Passengers
- [ ] 添加 Payment 并验证 Outstanding 更新
- [ ] 删除 Item
- [ ] 删除 Passenger
- [ ] 删除整个订单
- [ ] 表单验证（必填字段）
- [ ] 日期选择器功能
- [ ] 下拉选择功能（Payment Type, For）
- [ ] 错误处理和提示

---

当前进度：**API 完成，前端待实现** 
