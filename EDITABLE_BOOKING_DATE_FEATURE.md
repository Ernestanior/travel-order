# 可编辑 Booking Date 功能

## 功能说明

现在客户可以在编辑 Booking Order 时修改创建日期（Created on date）。

## 用户体验

### 查看模式（View Mode）

```
┌─────────────────────────────────────────────────┐
│ Booking #T100017                         [Edit] │
│ Created on 2026-07-02                           │
└─────────────────────────────────────────────────┘
```

- 显示 "Created on {date}" 作为只读文本
- 灰色字体，小号字体

### 编辑模式（Edit Mode）

```
┌─────────────────────────────────────────────────┐
│ Booking #T100017                   [Save] [Cancel]│
│                                                  │
│ Booking Date                                     │
│ ┌────────────────┐                              │
│ │ 2026-07-02  📅 │  ← 日期选择器                │
│ └────────────────┘                              │
└─────────────────────────────────────────────────┘
```

- 点击 **Edit** 按钮后
- "Created on" 文本消失
- 出现 "Booking Date" 标签
- 显示日期选择器，允许修改日期
- 点击日期输入框会弹出日历选择器

## 操作步骤

1. **进入编辑模式**
   - 打开 Booking Order 详情页
   - 点击右上角的 **Edit** 按钮

2. **修改日期**
   - 在 "Booking Date" 字段点击
   - 选择新的日期
   - 或者直接输入日期（格式：YYYY-MM-DD）

3. **保存修改**
   - 点击 **Save** 按钮
   - 系统会更新 booking date
   - 返回查看模式，显示新的日期

4. **取消修改**
   - 点击 **Cancel** 按钮
   - 日期恢复为原始值

## 技术实现

### 前端修改
**文件：** `app/booking-orders/[id]/page.tsx`

```tsx
// 修改前（只读显示）
<p className="text-sm text-gray-500 mt-1">
  Created on {order.bookingDate}
</p>

// 修改后（可编辑）
{isEditing ? (
  <div className="mt-2">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      Booking Date
    </label>
    <input
      type="date"
      value={displayData.bookingDate || ''}
      onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
    />
  </div>
) : (
  <p className="text-sm text-gray-500 mt-1">
    Created on {order.bookingDate}
  </p>
)}
```

### 后端支持
**文件：** `app/api/booking-orders/[id]/route.ts`

后端 API 已经支持更新 `bookingDate`：

```typescript
const booking = await prisma.bookingData.update({
  where: { id: parseInt(params.id) },
  data: {
    bookdate: body.bookingDate ? new Date(body.bookingDate) : null,
    // ... 其他字段
  }
})
```

## 数据库字段

```sql
-- booking_data 表
bookdate  DATE  -- 存储 booking 的创建日期
```

## 使用场景

### 场景 1: 修正录入错误
客户创建订单时选错了日期，现在可以直接在编辑模式下修正。

**示例：**
- 原日期: 2026-07-02
- 正确日期: 2026-07-01
- 操作: Edit → 修改 Booking Date → Save

### 场景 2: 补录历史订单
客户需要在系统中补录之前的旧订单。

**示例：**
- 今天: 2026-07-15
- 订单实际日期: 2026-06-01
- 操作: Edit → 修改 Booking Date 为 2026-06-01 → Save

### 场景 3: 调整业务日期
由于业务需求，需要将订单日期调整到特定的会计期间。

**示例：**
- 原日期: 2026-07-01 (新财年)
- 需要调整到: 2026-06-30 (旧财年)
- 操作: Edit → 修改 Booking Date → Save

## 注意事项

### ⚠️ 重要提醒

1. **修改日期不影响历史记录**
   - 修改 booking date 只改变显示的日期
   - 不会影响实际的创建时间戳（如果数据库有 created_at 字段）
   - Payment 记录、Item 记录等保持独立

2. **日期格式**
   - 系统使用标准日期格式: YYYY-MM-DD
   - 例如: 2026-07-02

3. **日期验证**
   - 浏览器的日期选择器会自动验证日期格式
   - 不允许输入无效日期（如 2026-02-30）

4. **时区考虑**
   - 日期按照服务器时区存储
   - 显示时不包含时间，只有日期

## 测试建议

### 测试用例 1: 正常修改
1. 打开任意 Booking Order
2. 点击 Edit
3. 修改 Booking Date 为其他日期
4. 点击 Save
5. **预期**: 日期更新成功，页面显示新日期

### 测试用例 2: 取消修改
1. 打开任意 Booking Order，记住原日期
2. 点击 Edit
3. 修改 Booking Date
4. 点击 Cancel（不保存）
5. **预期**: 日期恢复为原始值

### 测试用例 3: 修改为历史日期
1. 打开 Booking Order
2. 点击 Edit
3. 修改 Booking Date 为过去的日期（如 2026-01-01）
4. 点击 Save
5. **预期**: 允许设置历史日期，保存成功

### 测试用例 4: 修改为未来日期
1. 打开 Booking Order
2. 点击 Edit
3. 修改 Booking Date 为未来的日期（如 2027-01-01）
4. 点击 Save
5. **预期**: 允许设置未来日期，保存成功

## 与其他功能的关系

### ✅ 不影响
- Payment records - 保持独立
- Item records - 保持独立
- Passenger records - 保持独立
- Invoice PDF - 会使用新的 booking date

### ✅ 可能影响
- **Reports** - 如果报表按 booking date 筛选，会受影响
- **Outstanding Before Date** - 搜索功能可能受影响
- **Financial Records** - 会计记录可能需要注意日期变更

## 权限控制

目前所有可以编辑 Booking Order 的用户都可以修改 booking date。

如果将来需要限制权限：
- 可以添加角色检查
- 可以只允许管理员修改日期
- 可以记录日期变更历史

## 修复日期

2026-07-02

## 相关文件

- ✅ `app/booking-orders/[id]/page.tsx` - 前端编辑界面
- ✅ `app/api/booking-orders/[id]/route.ts` - 后端 API（已支持）
