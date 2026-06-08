# 空数据库问题修复

## 问题描述

当点击 "New Booking" 或访问任何列表页面时，出现错误：
```
TypeError: currentOrders.map is not a function
```

## 根本原因

1. **数据库为空**：当前数据库中所有表都是空的（0条记录）
2. **前端错误处理不足**：当 API 返回空数据或错误格式时，前端没有正确处理，导致 `undefined` 或非数组值被当作数组使用

## 已修复的文件

已为所有列表页面添加了更健壮的错误处理：

1. ✅ `app/booking-orders/page.tsx` - Booking Orders 列表
2. ✅ `app/exchange-orders/page.tsx` - Exchange Orders 列表
3. ✅ `app/customers/page.tsx` - Customers 列表
4. ✅ `app/suppliers/page.tsx` - Suppliers 列表
5. ✅ `app/passenger-inquiry/page.tsx` - Passenger Inquiry

### 修复内容

为每个 `loadXxx()` 函数添加了防御性编程：

```typescript
if (result.data && Array.isArray(result.data)) {
  setData(result.data)
  setTotalRecords(result.pagination?.total || result.data.length)
} else if (Array.isArray(result)) {
  setData(result)
  setTotalRecords(result.length)
} else {
  // 如果返回的不是数组，设置为空数组
  setData([])
  setTotalRecords(0)
}
```

以及错误处理中的兜底：

```typescript
catch (error) {
  console.error('Error loading data:', error)
  setData([])
  setTotalRecords(0)
}
```

## 现在需要做什么

### 选项 1：导入数据（推荐）

如果你想使用真实数据，需要从 `assets/db.mdb` 文件导入数据到数据库：

```bash
# 运行批量导入脚本
npx tsx scripts/batch-import.ts
```

这个脚本会：
- 从 MDB 文件中导出所有表
- 导入 Customers（客户）
- 导入 Suppliers（供应商）
- 导入 Booking Orders（预订订单）
- 导入 Exchange Orders（交换订单）
- 导入 Passengers（乘客）
- 导入 Items（项目）
- 导入 Payments（付款）

**预计导入时间**：10-30分钟（取决于网络和数据库性能）

**预计数据量**：
- Customers: ~18,000
- Suppliers: ~390
- Booking Orders: ~28,000
- Exchange Orders: ~28,000
- Passengers: ~76,000
- Items: ~50,000
- Payments: ~76,000

### 选项 2：从零开始使用（无需导入）

如果你只是想测试新建功能，可以：

1. 直接访问 `/booking-orders/new` 创建新订单
2. 系统现在可以正确处理空数据库的情况
3. 新建的数据会正常显示在列表中

## 测试步骤

1. **访问主页**：`http://localhost:3000` - 应该正常显示（显示0条记录）
2. **访问 Booking Orders**：`http://localhost:3000/booking-orders` - 显示空列表（无错误）
3. **点击 New Booking**：`http://localhost:3000/booking-orders/new` - 应该正常打开表单
4. **创建新订单**：填写表单并保存 - 应该成功创建
5. **查看订单列表**：返回列表页 - 应该显示刚创建的订单

## 验证修复

运行以下命令检查数据库状态：

```bash
# 检查数据库中的记录数
npx tsx scripts/check-data.ts
```

当前状态应该显示：
```
✓ Customers: 0
✓ Suppliers: 0
✓ Booking Orders: 0
✓ Exchange Orders: 0
✓ Passengers: 0
✓ Booking Items: 0
✓ Exchange Items: 0
✓ Booking Payments: 0
✓ Exchange Payments: 0
```

## 下一步

如果你决定导入数据，运行：

```bash
cd /Users/ern/Desktop/code/airline-order
npx tsx scripts/batch-import.ts
```

导入完成后，再次运行检查脚本确认：

```bash
npx tsx scripts/check-data.ts
```

---

**修复日期**：2026-06-04
**问题类型**：前端错误处理 + 空数据库
**状态**：✅ 已修复
