# 执行数据库清理

## ⚠️ 重要提示

在执行清理之前，请确认：

- [ ] **已备份数据库**
- [ ] 已阅读 `CLEAR_DATABASE_INSTRUCTIONS.md`
- [ ] 理解此操作将删除所有订单数据
- [ ] 已通知所有用户系统维护
- [ ] 已将系统设置为维护模式（如适用）

## 执行命令

```bash
# 1. 确保在项目根目录
cd /Users/ern/Desktop/code/airline-order

# 2. 执行清理脚本
npx tsx scripts/clear-and-reset-data.ts
```

## 如果遇到错误

### 错误：tsx not found
```bash
npm install -D tsx
```

### 错误：Cannot find module '@prisma/client'
```bash
npm install
npx prisma generate
```

### 错误：Database connection failed
检查 `.env` 文件中的 `DATABASE_URL` 是否正确

## 执行后验证

1. 检查控制台输出，确认所有数据已删除
2. 打开应用，尝试创建新的 Booking Order
3. 验证 Booking Number 为 T100001
4. 创建 Exchange Order，验证号码为 1100001
5. 添加 Payment，验证 Receipt Number 为 R100001

## 完成！

清理完成后，系统将使用新的 ID 格式：
- Booking Orders: **T100001**, T100002, T100003...
- Exchange Orders: **1100001**, 1100002, 1100003...
- Payment Receipts: **R100001**, R100002, R100003...
