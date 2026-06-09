# Account Feature - Complete

## 概述
为Booking Order详情页添加了Account功能，用于查看和管理订单的完整财务明细，包括收入、支出和利润计算。

## 功能分析

Account页面是一个**财务对账页面**，显示一个booking order的完整财务流水：

### 核心功能

#### 1. 收入部分
- **TBF (To Be Filled) Amount**: 显示订单的总收入（Total After Discount）
- 这是从booking order的总金额中扣除discount后的金额

#### 2. 支出部分

**Exchange Orders（机票换票支出）**
- 显示所有关联到该booking的exchange orders
- 字段：
  - Exchange #（换票单号）
  - Supplier（供应商/航空公司）
  - Paid Date（支付日期）
  - Payment Mode（支付方式）
  - Amount（金额）
- 自动计算总支出

**Hotel Vouchers（酒店voucher支出）**
- 可添加和管理酒店预订信息
- 字段：
  - Voucher #（凭证号）
  - Name of Hotel（酒店名称）
  - Guest（客人姓名）
  - Check In（入住日期）
  - Check Out（退房日期）
  - Amount（金额）
- 支持添加多个voucher
- 支持删除voucher
- 自动计算总支出

#### 3. 利润计算
```
Profit = Total TBF Amount - Exchange Orders Total - Hotel Vouchers Total
```
- 实时自动计算
- 绿色显示正利润，红色显示负利润
- 醒目的边框高亮显示

#### 4. 支付记录表单
用于记录向供应商/酒店的支付：
- Agent（代理人）
- EO Number (Hand Written)（手写EO编号）
- Payment Mode（支付方式）：Cash, Cheque, Visa, Debit, Bank Transfer
- Paid Date（支付日期）
- Amount（金额）

## 实现的组件

### 1. AccountModal.tsx
- **路径**: `/app/booking-orders/[id]/AccountModal.tsx`
- **特点**:
  - 全屏模态框，最大宽度6xl
  - 可滚动内容
  - 粘性头部和底部
  - 响应式布局

### 2. Exchanges API
- **路径**: `/app/api/booking-orders/[id]/exchanges/route.ts`
- **功能**:
  - 根据booking的bookno查找所有相关的exchange orders
  - 聚合exchange order的items计算总金额
  - 获取支付信息（最新的支付记录）
  - 返回格式化的exchange列表

#### API响应格式:
```json
{
  "data": [
    {
      "exchangeno": "EX001",
      "supplier": "SCOOT AIRLINE",
      "paidDate": "2026-03-13",
      "paymentMode": "Visa",
      "amount": 178.59,
      "paid": 178.59,
      "outstanding": 0
    }
  ]
}
```

### 3. Booking Detail页面更新
- **路径**: `/app/booking-orders/[id]/page.tsx`
- **更新**:
  - 添加了"Account"按钮（紫色，Calculator图标）
  - 集成AccountModal组件
  - 传递必要的props（bookingId, bookingNumber, totalAmount）

## UI特点

### 布局
1. **头部区域**
   - 显示"Account Details"标题
   - 显示TBF编号（booking number）
   - 关闭按钮

2. **TBF Amount卡片**
   - 蓝色背景高亮
   - 大字体显示总金额

3. **Exchange Orders表格**
   - 灰色表头
   - 清晰的列分隔
   - 底部显示小计

4. **Hotel Vouchers表格**
   - 可编辑的行
   - 添加按钮
   - 删除按钮（每行）
   - 底部显示小计

5. **Profit框**
   - 绿色边框（醒目）
   - 大字体显示
   - 颜色根据正负值变化

6. **支付表单**
   - 灰色背景区分
   - 2列网格布局
   - 清晰的标签

7. **底部按钮**
   - 粘性定位
   - 灰色背景
   - Close按钮

### 颜色方案
- Account按钮：紫色（`bg-purple-600`）
- TBF Amount：蓝色（`bg-blue-50`, `text-blue-600`）
- Profit：绿色边框，根据值变化文字颜色
- 添加按钮：蓝色（`bg-blue-600`）
- 删除按钮：红色（`text-red-600`）

## 数据流

### 加载流程
1. 用户点击"Account"按钮
2. 打开AccountModal
3. 调用`/api/booking-orders/[id]/exchanges`获取exchange orders
4. 显示exchange orders列表
5. 初始化空的hotel vouchers列表
6. 自动计算profit

### 计算流程
1. 监听totalAmount, exchangeOrders, hotelVouchers变化
2. 计算Exchange Orders总和
3. 计算Hotel Vouchers总和
4. Profit = totalAmount - exchange总和 - hotel总和
5. 更新UI显示

## 后续改进建议

### 功能增强
1. **保存Hotel Vouchers**: 创建数据库表和API来持久化hotel voucher数据
2. **支付记录保存**: 实现Add按钮的保存功能，将支付记录存入数据库
3. **打印功能**: 添加打印Account报表的功能
4. **导出功能**: 导出为PDF或Excel
5. **历史记录**: 显示所有支付记录的历史
6. **备注功能**: 为exchange orders和vouchers添加备注字段

### 数据库设计建议
```sql
-- Hotel Vouchers表
CREATE TABLE hotel_vouchers (
  id SERIAL PRIMARY KEY,
  bookno VARCHAR(50) NOT NULL,
  voucher_no VARCHAR(50),
  hotel_name VARCHAR(255),
  guest VARCHAR(255),
  check_in DATE,
  check_out DATE,
  amount DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookno) REFERENCES booking_data(bookno)
);

-- Account Payments表（向供应商/酒店的支付）
CREATE TABLE account_payments (
  id SERIAL PRIMARY KEY,
  bookno VARCHAR(50) NOT NULL,
  agent VARCHAR(100),
  eo_number VARCHAR(50),
  payment_mode VARCHAR(50),
  paid_date DATE,
  amount DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookno) REFERENCES booking_data(bookno)
);
```

### UI改进
1. **加载状态**: 添加骨架屏或加载动画
2. **错误处理**: 更好的错误提示
3. **表单验证**: 实时验证输入
4. **确认对话框**: 删除voucher时询问确认
5. **自动保存**: 实时保存voucher变更

## 测试建议
1. ✅ 点击Account按钮打开模态框
2. ✅ 显示正确的TBF金额
3. ✅ 加载并显示exchange orders
4. ✅ 正确计算exchange total
5. ✅ 添加hotel voucher
6. ✅ 编辑hotel voucher字段
7. ✅ 删除hotel voucher
8. ✅ 正确计算hotel total
9. ✅ Profit自动更新计算
10. ✅ 关闭模态框

## 文件清单
```
/app/booking-orders/[id]/AccountModal.tsx          # Account模态框组件
/app/api/booking-orders/[id]/exchanges/route.ts   # Exchange orders API
/app/booking-orders/[id]/page.tsx                  # 更新：添加Account按钮
```

## 按钮位置
在Booking Order详情页的头部，按钮顺序：
1. **Edit** (灰色)
2. **Account** (紫色) ← 新增
3. **Make Payment** (绿色)
4. **Delete** (红色)

---
✅ Account功能已完成并可以使用
⚠️ Hotel Vouchers和Payment Records的持久化功能需要后续实现
