# 填充跳号功能说明

## 功能概述

在 Booking Orders 列表页面添加了"Fill Missing Numbers"按钮，允许用户手动填充订单编号中的空缺。

## 功能位置

**页面**: Booking Orders 列表页 (`/booking-orders`)
**位置**: 页面右上角，"New Booking" 按钮左边

## 使用方法

1. 进入 Booking Orders 列表页面
2. 点击右上角的 **"Fill Missing Numbers"** 按钮（橙色）
3. 系统会弹出确认对话框
4. 点击确认后，系统会自动：
   - 扫描所有现有订单
   - 找出从最小到最大编号之间的所有缺失编号
   - 为每个缺失的编号创建占位订单

## 占位订单特征

填充的占位订单具有以下特征：

- **Customer**: `[PLACEHOLDER]`
- **Status**: `Placeholder`
- **Booking Date**: `2000-01-01`
- **Special**: `Auto-filled placeholder order`
- **其他字段**: 空值或默认值

## 示例

假设现有订单编号为：T100001, T100002, T100005, T100008

点击"Fill Missing Numbers"后，系统会自动创建：
- T100003
- T100004
- T100006
- T100007

结果：订单编号变为连续的 T100001 ~ T100008

## API 端点

**URL**: `/api/booking-orders/fill-gaps`
**Method**: `POST`
**Response**:
```json
{
  "success": true,
  "message": "成功填充 4 个跳号",
  "filled": ["T100003", "T100004", "T100006", "T100007"],
  "total": 4
}
```

## 技术实现

### 后端 API

文件: `app/api/booking-orders/fill-gaps/route.ts`

功能：
1. 查询所有现有订单
2. 提取订单编号的数字部分
3. 找出最小值和最大值之间的缺失编号
4. 使用数据库事务批量创建占位订单
5. 返回创建结果

### 前端组件

文件: `app/booking-orders/page.tsx`

新增功能：
- `handleFillGaps()` 函数：处理填充请求
- "Fill Missing Numbers" 按钮：触发填充操作
- 加载状态管理：按钮显示 "Filling..." 时禁用

## 注意事项

1. **手动触发**: 此功能需要用户手动点击按钮，不会自动执行
2. **确认对话框**: 执行前会弹出确认对话框，防止误操作
3. **事务安全**: 使用数据库事务确保所有占位订单要么全部创建成功，要么全部回滚
4. **重复检查**: 创建前会检查订单是否已存在，避免重复创建
5. **自动刷新**: 填充完成后会自动刷新订单列表

## 何时使用

建议在以下情况使用此功能：

1. 发现订单编号有跳号时
2. 系统维护或数据迁移后
3. 定期检查订单编号连续性时
4. 创建新订单前，确保编号连续

## 删除占位订单

如果需要删除占位订单，可以使用以下脚本：

```bash
node delete-placeholder-orders.js
```

该脚本会：
- 只删除 `customer='[PLACEHOLDER]'` 且 `status='Placeholder'` 的订单
- 检查是否有关联的 Exchange Orders
- 安全删除订单及其关联数据

## 相关脚本

1. **fill-missing-orders.js** - 命令行版本的填充脚本
2. **delete-placeholder-orders.js** - 批量删除占位订单
3. **check-orders.js** - 检查订单详情
4. **verify-display-no.js** - 验证 display_no 字段

## 故障排除

### 问题：点击按钮后没有反应

**解决方法**：
1. 检查浏览器控制台是否有错误
2. 确认 API 端点是否正常运行
3. 检查数据库连接

### 问题：填充后编号仍有缺失

**解决方法**：
1. 刷新页面
2. 检查是否有并发创建订单的操作
3. 再次点击"Fill Missing Numbers"按钮

### 问题：填充了不需要的占位订单

**解决方法**：
运行删除脚本：
```bash
node delete-placeholder-orders.js
```

## 未来改进

可能的改进方向：

1. **批量预览**: 显示将要填充的编号列表，让用户选择是否填充
2. **限制范围**: 允许用户指定填充的编号范围
3. **自动检测**: 定期自动检测跳号并提醒用户
4. **历史记录**: 记录每次填充操作的历史
5. **权限控制**: 只允许管理员使用此功能
