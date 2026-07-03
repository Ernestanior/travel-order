# 浮点数精度问题修复报告

## 问题描述

客户反馈说：
1. 输入整数金额后，会多出 $0.01
2. 删除所有 items 后，Outstanding 仍然显示 $0.01

例如截图显示：
- Items: 没有任何项目
- Total Amount: $0.00
- Total Paid: $0.00
- **Outstanding: $0.01** ❌（不应该存在）

## 根本原因

这是经典的 **JavaScript 浮点数精度问题**。

在 JavaScript 中，浮点数运算会产生精度误差：
```javascript
// 示例
0.1 + 0.2 = 0.30000000000000004  // 而不是 0.3
100 - 99.99 = 0.009999999999990905  // 而不是 0.01
```

在我们的代码中，outstanding 的计算方式：
```javascript
const outstanding = (totalCost - discount) - paid
```

当涉及多次浮点数运算时，微小的精度误差会累积，导致本应为 0 的结果变成 0.00999... 或 0.01000...

## 解决方案

使用 `Math.round()` 在所有金额计算中保留两位小数精度：

```javascript
// 修复前
const outstanding = (totalCost - discount) - paid

// 修复后
const totalAfterDiscount = Math.round((totalCost - discount) * 100) / 100
const outstanding = Math.round((totalAfterDiscount - paid) * 100) / 100
```

**工作原理：**
1. 乘以 100 → 将小数转换为整数（例如：1.234 → 123.4）
2. Math.round() → 四舍五入到最接近的整数（123.4 → 123）
3. 除以 100 → 转换回小数（123 → 1.23）

这样可以确保所有金额都精确到分（2位小数）。

## 修改的文件

### 后端 API（7个文件）

1. **`app/api/booking-orders/[id]/route.ts`**
   - 修复了获取单个 booking order 的 outstanding 计算

2. **`app/api/booking-orders/route.ts`**
   - 修复了获取 booking orders 列表的 outstanding 计算（2处）
   - 包括普通列表和 outstanding 筛选列表

3. **`app/api/booking-orders/[id]/payments/route.ts`**
   - 修复了创建 payment 后自动关闭订单的 outstanding 计算

4. **`app/api/exchange-orders/[id]/route.ts`**
   - 修复了获取单个 exchange order 的 outstanding 计算

5. **`app/api/exchange-orders/route.ts`**
   - 修复了获取 exchange orders 列表的 outstanding 计算

6. **`app/api/exchange-orders/[id]/payments/route.ts`**
   - 修复了创建 exchange payment 后自动关闭订单的 outstanding 计算

### 前端（1个文件）

7. **`app/booking-orders/[id]/page.tsx`**
   - 修复了前端加载订单后重新计算 outstanding 的逻辑

## 影响范围

✅ Booking Orders - 列表页面  
✅ Booking Orders - 详情页面  
✅ Booking Orders - Payment 功能  
✅ Exchange Orders - 列表页面  
✅ Exchange Orders - 详情页面  
✅ Exchange Orders - Payment 功能  

## 测试建议

1. **创建订单测试**
   - 创建 items 总价为整数的订单（如 $100.00）
   - 验证 Outstanding 显示正确

2. **删除 items 测试**
   - 编辑订单，删除所有 items
   - 验证 Outstanding 变为 $0.00（而不是 $0.01）

3. **Payment 测试**
   - 添加 payment 等于总金额
   - 验证 Outstanding 变为 $0.00
   - 验证订单状态自动变为 "Close"

4. **小数测试**
   - 创建包含小数的 items（如 $99.99）
   - 添加各种金额的 payments
   - 验证所有金额计算正确，无精度误差

## 注意事项

- 数据库使用 `Decimal(15, 2)` 类型，本身是精确的
- 问题只出现在 JavaScript 的浮点数运算中
- 此修复不会影响数据库中已有的数据
- 此修复向后兼容，不会破坏现有功能

## 修复日期

2026-07-02
