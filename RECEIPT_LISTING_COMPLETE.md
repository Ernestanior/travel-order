# Payment Receipts Listing Feature - Complete

## 概述
为系统添加了完整的收据（Receipt）列表查看功能，用户现在可以查看所有payment records。

## 实现的功能

### 1. Receipt列表页面 (`/receipts`)
- **路径**: `/app/receipts/page.tsx`
- **功能**:
  - 显示所有payment receipts的列表
  - 支持分页（每页50条记录）
  - 响应式表格设计
  - 点击行查看相关的booking order

### 2. 搜索和筛选功能
- **Receipt Number搜索**: 按收据号搜索
- **Booking Number搜索**: 按预订号搜索
- **Customer搜索**: 按客户名搜索
- **日期范围搜索**: 按收据日期范围筛选（from date to date）
- 所有搜索条件可以组合使用
- 实时显示搜索结果数量

### 3. 表格显示字段
| 字段 | 说明 |
|------|------|
| Receipt # | 收据编号 |
| Booking # | 关联的预订编号 |
| Date | 收据日期 |
| Customer | 客户名称 |
| Payment Type | 支付类型（Cash, Cheque, Visa等）|
| For | 支付用途（Full Payment, Deposit, Balance）|
| Amount | 支付金额 |
| Cheque / Visa No | 支票号或信用卡号 |

### 4. API端点
- **路径**: `/app/api/receipts/route.ts`
- **方法**: GET
- **功能**:
  - 从`booking_payment_data`表获取所有receipts
  - 支持多条件搜索和筛选
  - 后端分页
  - 按收据日期倒序排列（最新的在前）

#### API参数:
```
page: 页码（默认1）
limit: 每页记录数（默认50）
receiptNo: 收据号搜索
bookingNumber: 预订号搜索
customer: 客户名搜索
dateFrom: 开始日期
dateTo: 结束日期
```

#### API响应格式:
```json
{
  "data": [
    {
      "id": 1,
      "receiptNo": "R001",
      "bookingNumber": "BK001",
      "receiptDate": "2024-01-15",
      "paymentType": "Cash",
      "for": "Full Payment",
      "chequeNo": "",
      "visaNo": "",
      "amountPaid": 500.00,
      "paidText": "Five Hundred Dollars",
      "customer": "John Doe",
      "payFor": "Tour ABC"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

### 5. 主页集成
- 在主页添加了"Payment Receipts"入口
- 使用Receipt图标
- 中英文描述："查看和打印所有付款收据"

## 数据库表
使用现有的 `booking_payment_data` 表:
```sql
- id: 主键
- receiptno: 收据编号
- bookno: 关联的booking编号
- receiptdate: 收据日期
- paytype: 支付类型
- for: 支付用途
- chequeno: 支票号
- visano: 信用卡号
- amountpaid: 支付金额
- paidtext: 金额文字描述
- customer: 客户名
- payfor: 支付给谁
```

## 用户交互
1. **查看列表**: 用户访问`/receipts`查看所有收据
2. **搜索**: 使用搜索框快速找到特定收据
3. **筛选**: 按日期范围筛选收据
4. **分页**: 浏览大量收据记录
5. **查看详情**: 点击收据行跳转到相关的booking order（TODO: 需要改进为直接跳转到具体booking详情页）

## UI特点
- 清晰的搜索和筛选面板
- 实时显示搜索结果统计
- 支持清空所有筛选条件
- 分页控制（Previous/Next + 页码）
- 空状态提示（无数据时显示）
- 加载状态动画

## 后续改进建议
1. **直接跳转**: 点击receipt时直接跳转到对应booking的详情页
2. **打印功能**: 添加单个或批量打印收据的功能
3. **导出功能**: 导出为PDF或Excel
4. **排序功能**: 支持按不同字段排序
5. **高级筛选**: 添加按支付类型、金额范围筛选

## 文件清单
```
/app/receipts/page.tsx              # Receipt列表页面
/app/api/receipts/route.ts          # Receipt API端点
/app/page.tsx                       # 更新主页（添加入口）
```

## 测试建议
1. 访问 `/receipts` 确认页面正常加载
2. 测试所有搜索功能
3. 测试分页功能
4. 测试日期范围筛选
5. 测试清空筛选功能
6. 确认点击receipt行的跳转功能

## 已修复的问题
- 修复了 `booking-orders/[id]/route.ts` 中的重复属性 `discount` 错误
- 添加了 `dynamic = 'force-dynamic'` 到receipts API以支持动态参数

---
✅ Receipt列表功能已完成并可以使用
