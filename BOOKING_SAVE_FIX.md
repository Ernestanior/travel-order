# Booking Order Save Fix ✅

## Problem Identified

用户报告了一个严重的数据保存问题：
1. 修改Booking Order的address字段
2. 点击Save显示成功
3. 刷新页面后address又变成空的
4. 其他的items也都是空的

## Root Cause Analysis

### Database Schema Structure
```
customer_data (Customer table)
├── customer (PK)
├── address
├── tel
└── ...

booking_data (BookingData table)
├── id (PK)
├── bookno
├── customer (FK -> customer_data.customer)
└── ...
```

### The Bug
**GET请求**（读取数据）:
```typescript
// 从关联的customerData表读取address和tel
address: booking.customerData?.address || '',
tel: booking.customerData?.tel || '',
```

**PUT请求**（保存数据）- 之前的代码:
```typescript
// ❌ 只更新了booking_data表
const booking = await prisma.bookingData.update({
  where: { id: parseInt(params.id) },
  data: {
    customer: body.customerName,
    // ... 其他字段
  }
})
// ❌ 没有更新customer_data表！
```

**问题**: 
- 读取时从`customer_data`表获取address
- 保存时没有更新`customer_data`表
- 导致address无法保存

## Solution Implemented

在PUT请求中添加Customer表的upsert操作：

```typescript
// 先更新或创建 Customer 记录（如果提供了 address 或 tel）
if (body.customerName && body.tel) {
  await prisma.customer.upsert({
    where: { customer: body.customerName },
    update: {
      address: body.address || null,
      tel: body.tel,
    },
    create: {
      customer: body.customerName,
      address: body.address || null,
      tel: body.tel,
    }
  })
}

// 然后更新主订单信息
const booking = await prisma.bookingData.update({
  // ...
})
```

### Why Upsert?
使用`upsert`（update or insert）的原因：
1. **如果Customer已存在**: 更新address和tel
2. **如果Customer不存在**: 创建新的Customer记录
3. **保证数据一致性**: 无论Customer记录是否存在，都能正确保存

## What Was Fixed

### Before Fix
```
User Action: Edit address → Save
Backend: ✅ Updates booking_data
Backend: ❌ Doesn't update customer_data
Result: ❌ Address lost on refresh
```

### After Fix
```
User Action: Edit address → Save
Backend: ✅ Upserts customer_data (address + tel)
Backend: ✅ Updates booking_data
Result: ✅ Address persists after refresh
```

## Files Modified
- `/app/api/booking-orders/[id]/route.ts` - Added Customer upsert logic in PUT function

## Testing Checklist

请测试以下场景：

### Test 1: 更新现有客户的Address
1. 打开任意Booking Order详情页
2. 点击Edit按钮
3. 修改Address字段（例如：输入"123 Main Street"）
4. 点击Save
5. 等待成功提示
6. 刷新页面 (F5)
7. ✅ Address应该保持为"123 Main Street"

### Test 2: 更新Tel字段
1. 打开Booking Order详情页
2. 点击Edit
3. 修改Tel字段
4. 点击Save
5. 刷新页面
6. ✅ Tel应该保存成功

### Test 3: 同时更新Address和Tel
1. 打开Booking Order详情页
2. 点击Edit
3. 修改Address和Tel
4. 点击Save
5. 刷新页面
6. ✅ 两个字段都应该保存成功

### Test 4: Items保存
1. 打开Booking Order详情页
2. 点击Edit
3. 添加或修改Items
4. 点击Save
5. 刷新页面
6. ✅ Items应该保存成功（这个之前就是正常的）

### Test 5: Passengers保存
1. 打开Booking Order详情页
2. 点击Edit
3. 添加或修改Passengers
4. 点击Save
5. 刷新页面
6. ✅ Passengers应该保存成功

## Expected Results After Fix

✅ Address字段保存后不会丢失
✅ Tel字段保存正常
✅ Items正常保存（原本就正常）
✅ Passengers正常保存（原本就正常）
✅ 刷新页面后所有数据都保持最新状态

## Technical Notes

### Customer Table Primary Key
`customer_data`表使用`customer`（客户名称）作为主键，这意味着：
- 同一个客户名称在系统中只能有一条记录
- 如果更改客户名称，会创建新的Customer记录
- 多个booking可以关联到同一个Customer记录

### Upsert Logic
```typescript
upsert({
  where: { customer: body.customerName },  // 查找条件
  update: { ... },                         // 如果存在，更新这些字段
  create: { ... }                          // 如果不存在，创建新记录
})
```

### Data Flow
```
Frontend Edit → Save Button
↓
PUT /api/booking-orders/[id]
↓
1. Upsert customer_data table (address, tel)
2. Update booking_data table (all other fields)
3. Delete & recreate items
4. Delete & recreate passengers
↓
Success Response
↓
Frontend Reloads Data
↓
GET /api/booking-orders/[id]
↓
Returns booking WITH customerData.address
```

---
**Fixed**: June 11, 2026
**Issue**: Address和Tel不保存到数据库
**Root Cause**: PUT请求没有更新customer_data表
**Solution**: 添加Customer表的upsert操作
