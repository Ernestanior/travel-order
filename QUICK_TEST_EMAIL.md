# Email功能快速测试指南

## 问题排查
你提到"修改了，保存完了还是空"，让我们一步步验证：

## 测试步骤

### 第1步：确认开发服务器重启
```bash
# 停止当前服务器（Ctrl+C 或 Cmd+C）
# 重新启动
npm run dev
```

### 第2步：在浏览器中测试

1. **打开一个booking order详情页**
   - 访问: `http://localhost:3000/booking-orders/1043522` (或其他订单ID)
   
2. **检查是否显示Email字段**
   - 在"Customer Information"部分应该能看到Email标签
   - 在Tel / HP字段下方

3. **点击Edit按钮**
   - 应该能看到Email输入框

4. **输入email并保存**
   - 输入: `test@example.com`
   - 点击Save按钮
   - 等待成功提示

5. **刷新页面验证**
   - 按F5或刷新按钮
   - Email应该显示你刚才输入的值

### 第3步：检查浏览器控制台

打开浏览器开发者工具（F12），切换到Console标签：

1. **保存时检查请求**
```javascript
// 应该看到类似这样的请求
PUT /api/booking-orders/[id]
// 点击查看Request Payload，确认包含email字段
```

2. **检查响应**
```javascript
// 应该返回
{ "success": true, "id": 数字 }
```

### 第4步：直接查询数据库验证

运行以下脚本检查特定客户的email：
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.customer.findUnique({
  where: { customer: 'PAN HANG HUA MR' }  // 替换为你测试的客户名
}).then(c => {
  console.log('Customer:', c.customer);
  console.log('Email:', c.email);
  prisma.\$disconnect();
});
"
```

## 可能的问题和解决方案

### 问题1: Email输入框不显示
**原因**: 前端代码没有更新或缓存问题
**解决**:
```bash
# 清除浏览器缓存
Ctrl+Shift+Delete (或 Cmd+Shift+Delete)
# 或者硬刷新
Ctrl+F5 (或 Cmd+Shift+R)
```

### 问题2: 保存后email还是空
**可能原因A**: 后端API没有更新
**检查**: 打开 `/app/api/booking-orders/[id]/route.ts`，确认第155-165行包含email处理

**可能原因B**: 前端没有传递email
**检查**: 浏览器控制台Network标签，查看PUT请求的payload是否包含email

**可能原因C**: 数据库没有email列
**验证**: 运行
```bash
node check-and-add-email.js
```

### 问题3: 类型错误
**解决**:
```bash
# 重新生成Prisma Client
npx prisma generate

# 重启TypeScript服务器（在VS Code中）
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

## 调试命令

### 查看customer_data表结构
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'customer_data'
\`.then(r => { console.table(r); prisma.\$disconnect(); });
"
```

### 查看某个客户的完整信息
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.customer.findFirst().then(c => { 
  console.log(JSON.stringify(c, null, 2)); 
  prisma.\$disconnect(); 
});
"
```

### 手动更新email测试
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.customer.findFirst().then(async c => {
  const updated = await prisma.customer.update({
    where: { customer: c.customer },
    data: { email: 'manual-test@example.com' }
  });
  console.log('Updated:', updated);
  prisma.\$disconnect();
});
"
```

## 成功标志

当一切正常工作时，你应该看到：
- ✅ Edit模式下有Email输入框
- ✅ 保存后显示成功提示
- ✅ 刷新页面后email显示正确的值
- ✅ 浏览器控制台没有错误
- ✅ Network请求显示200 OK

如果还有问题，请检查浏览器控制台的错误信息，并运行上面的调试命令。
