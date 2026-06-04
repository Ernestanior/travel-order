# 分页功能说明

## 📄 概述

所有列表页面现在都支持分页功能，每页显示 **50条记录**。

---

## ✅ 已添加分页的页面

### 1. **Booking Orders（预订订单）**
- 路径: `/booking-orders`
- 每页: 50条订单
- 支持所有搜索模式的分页：
  - 全部订单
  - 按出发日期
  - 未付款订单
  - 按客户名称

### 2. **Exchange Orders（交换订单）**
- 路径: `/exchange-orders`
- 每页: 50条订单
- 支持按供应商搜索的分页

### 3. **Customers（客户）**
- 路径: `/customers`
- 每页: 50个客户
- 支持客户名称搜索的分页

### 4. **Suppliers（供应商）**
- 路径: `/suppliers`
- 每页: 50个供应商
- 支持供应商名称搜索的分页

### 5. **Passenger Inquiry（乘客查询）**
- 路径: `/passenger-inquiry`
- 每页: 50条记录
- 支持按客户搜索的分页

---

## 🎨 分页控件功能

### 基本功能
- ✅ **Previous（上一页）** 按钮
- ✅ **Next（下一页）** 按钮
- ✅ **页码按钮** - 直接跳转到指定页
- ✅ **当前页高亮** - 黑色背景突出显示
- ✅ **省略号（...）** - 页数过多时显示

### 智能页码显示
页码按钮会根据总页数智能显示：

#### 总页数 ≤ 7页
显示所有页码：`1 2 3 4 5 6 7`

#### 当前在前面（页数 ≤ 4）
显示格式：`1 2 3 4 5 ... 100`

#### 当前在中间
显示格式：`1 ... 48 49 50 ... 100`

#### 当前在后面（页数 ≥ 总数-3）
显示格式：`1 ... 96 97 98 99 100`

---

## 📊 显示信息

### 页面顶部统计
搜索后会显示：
```
Found 284 order(s) • Showing page 3 of 6
```

### 页面底部信息
分页控件上方显示：
```
Showing 101 to 150 of 284 results
```

---

## 🔧 技术实现

### 状态管理
```typescript
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 50
```

### 分页计算
```typescript
const totalPages = Math.ceil(items.length / itemsPerPage)
const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = startIndex + itemsPerPage
const currentItems = items.slice(startIndex, endIndex)
```

### 页面跳转
```typescript
const goToPage = (page: number) => {
  setCurrentPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

---

## 💡 用户体验优化

### 1. **自动重置**
- 更改搜索条件时，自动回到第1页
- 避免显示空白页面

### 2. **平滑滚动**
- 切换页面时自动滚动到顶部
- 使用 `smooth` 滚动效果

### 3. **按钮禁用**
- 第1页时禁用 "Previous" 按钮
- 最后一页时禁用 "Next" 按钮
- 视觉反馈：灰色+不可点击

### 4. **响应式设计**
- 分页控件在小屏幕上也能正常显示
- 页码按钮大小适中，易于点击

---

## 🎯 使用示例

### 预订订单分页
```typescript
// 1. 用户访问 /booking-orders
// 2. 看到前50条订单（第1页）
// 3. 点击 "Next" 或页码 "2"
// 4. 显示第51-100条订单（第2页）
// 5. 可以通过页码直接跳到任意页
```

### 搜索结果分页
```typescript
// 1. 用户搜索客户 "John"
// 2. 找到120条匹配记录
// 3. 显示前50条（第1页，共3页）
// 4. 用户可以浏览所有3页的结果
```

---

## 📈 性能优化

### 前端分页
- 当前实现使用 **前端分页**
- 一次加载所有数据，然后在前端切片显示
- 适用于中等数量的数据（< 1000条）

### 未来改进（可选）
如果数据量很大，可以考虑：
1. **后端分页** - API只返回当前页的数据
2. **虚拟滚动** - 无限滚动加载更多数据
3. **数据缓存** - 缓存已加载的页面数据

---

## 🔄 API限制

### 当前限制
- Booking Orders API: 返回最多 **100条** 记录
- Exchange Orders API: 返回最多 **100条** 记录
- Customers API: 返回所有客户
- Suppliers API: 返回所有供应商

### 建议
如果需要显示更多数据，可以修改API：
```typescript
// app/api/booking-orders/route.ts
const bookings = await prisma.bookingData.findMany({
  // ...
  take: 500, // 增加限制
})
```

---

## 🎨 样式定制

### 颜色方案
- **当前页**: 黑色背景 (`bg-gray-900`)，白色文字
- **其他页**: 白色背景，黑色文字，灰色边框
- **悬停效果**: 浅灰色背景 (`bg-gray-100`)
- **禁用按钮**: 50%透明度

### 可自定义参数
```typescript
// 修改每页显示数量
const itemsPerPage = 50 // 改为 25、100 等

// 修改最大可见页码
const maxVisible = 7 // 改为 5、9 等
```

---

## 📱 移动端适配

### 小屏幕优化
- 页码按钮自动换行
- 统计信息可能缩小字体
- 保持可点击区域足够大

### 建议改进（可选）
对于手机屏幕，可以考虑：
```typescript
// 移动端只显示 3 个页码
const maxVisible = isMobile ? 3 : 7
```

---

## 🐛 已知限制

### 1. API数据限制
- 某些API有100条记录的限制
- 实际可能有更多数据，但API不返回

### 2. 前端分页
- 大数据量时可能有性能问题
- 建议数据量超过5000条时使用后端分页

### 3. 搜索结果
- 搜索是在已加载的数据中进行
- 不会搜索API未返回的数据

---

## ✨ 未来增强

### 可能的改进方向

#### 1. 后端分页
```typescript
// API支持分页参数
GET /api/booking-orders?page=2&limit=50
```

#### 2. 跳转到指定页
```typescript
// 添加输入框直接输入页码
<input 
  type="number" 
  min="1" 
  max={totalPages}
  placeholder="Go to page"
/>
```

#### 3. 可配置每页数量
```typescript
// 用户可以选择每页显示数量
<select value={itemsPerPage} onChange={...}>
  <option value={25}>25 per page</option>
  <option value={50}>50 per page</option>
  <option value={100}>100 per page</option>
</select>
```

#### 4. 记住页码
```typescript
// 使用 localStorage 或 URL 参数记住用户的当前页
localStorage.setItem('bookingOrdersPage', currentPage)
```

---

## 📝 测试清单

### 功能测试
- ✅ 点击"Next"按钮跳转到下一页
- ✅ 点击"Previous"按钮返回上一页
- ✅ 点击页码直接跳转
- ✅ 第1页时"Previous"按钮禁用
- ✅ 最后一页时"Next"按钮禁用
- ✅ 显示正确的记录范围
- ✅ 总页数计算正确

### 边界测试
- ✅ 只有1页时不显示分页控件（可选优化）
- ✅ 搜索无结果时不显示分页
- ✅ 恰好50条记录时显示1页
- ✅ 51条记录时显示2页

### UI测试
- ✅ 当前页高亮显示
- ✅ 悬停效果正常
- ✅ 移动端显示正常
- ✅ 页码换行不错乱

---

## 🎉 完成状态

**所有5个列表页面的分页功能已全部实现并测试通过！**

---

**更新日期**: 2026-06-04  
**版本**: 1.0.0  
**每页显示**: 50条记录
