# Email Field Setup Instructions

## 问题
Booking Order的详情和编辑页面缺少email字段显示和保存功能。

## 已完成的修改

### 1. 前端代码
- ✅ 在 `/app/booking-orders/[id]/page.tsx` 中添加了email字段显示和编辑
- ✅ 在 `BookingOrder` 接口中添加了 `email: string`
- ✅ 在PDF生成器中添加了email显示

### 2. 后端API
- ✅ GET API (`/api/booking-orders/[id]`) - 返回email字段
- ✅ PUT API (`/api/booking-orders/[id]`) - 保存email到customer表
- ✅ CREATE API (`/api/booking-orders/create`) - 已支持email

### 3. 数据库迁移

## 需要执行的步骤

### Step 1: 运行数据库迁移
在终端执行以下命令：

```bash
# 连接到你的PostgreSQL数据库并执行迁移脚本
psql -U your_username -d your_database -f ADD_EMAIL_MIGRATION.sql
```

或者直接在数据库客户端中执行：

```sql
-- Add email column to customer data table
ALTER TABLE "customer_data" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);

COMMENT ON COLUMN "customer_data"."email" IS 'Email address of customer';
```

### Step 2: 重新生成Prisma Client
```bash
npx prisma generate
```

### Step 3: 重启开发服务器
```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

## 验证

1. 打开一个booking order的详情页
2. 点击"Edit"按钮
3. 在Customer Information部分应该能看到Email字段
4. 输入email并保存
5. 刷新页面，email应该被保存并显示

## 注意事项

- Email字段是可选的（nullable），不会影响已有数据
- Prisma schema中已经包含email字段定义
- 所有修改都向后兼容
