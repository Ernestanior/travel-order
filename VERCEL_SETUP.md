# ⚡ Vercel 部署配置指南

## 🚨 重要：必须配置环境变量

部署到 Vercel 后，**必须**添加数据库环境变量，否则应用无法运行。

## 📝 配置步骤

### 1. 在 Vercel Dashboard 中打开你的项目

访问: https://vercel.com/dashboard

### 2. 进入项目设置

点击项目 → Settings → Environment Variables

### 3. 添加 DATABASE_URL

**变量名**: `DATABASE_URL`

**变量值**: 
```
postgresql://neondb_owner:npg_mxyoVWE4hF7Y@ep-little-hat-aq2iyqb1-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

**应用到**: 
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. 重新部署

添加环境变量后，需要重新部署：

**方式一：在 Vercel Dashboard**
- 进入 Deployments 标签
- 点击最新部署旁的 "..." 菜单
- 选择 "Redeploy"

**方式二：推送新代码**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

## ✅ 验证部署成功

部署完成后，访问你的 Vercel URL，你应该看到：

1. **主页** - 显示统计数据（如果数据库有数据）
2. **Booking Orders** - 可以加载订单列表
3. **所有页面** - 正常加载，无错误

## 🔍 故障排查

### 问题：页面显示 "Database not configured"

**解决方案**:
1. 确认 Vercel 环境变量已添加
2. 确认环境变量名称正确：`DATABASE_URL`
3. 重新部署项目

### 问题：Prisma 错误

**解决方案**:
1. 确认数据库 URL 正确
2. 确认 Neon 数据库在线
3. 检查 Vercel 部署日志

### 问题：数据为空

**原因**: 本地数据导入尚未完成

**解决方案**:
1. 等待本地数据导入完成
2. 运行 `npx tsx scripts/check-data.ts` 查看进度
3. 数据会自动同步到 Neon 数据库

## 📊 当前数据导入状态

运行以下命令查看数据导入进度：

```bash
npx tsx scripts/check-data.ts
```

**当前进度** (最后检查):
- ✅ Customers: 7,243+ 条
- ⏳ Suppliers: 导入中
- ⏳ Booking Orders: 导入中
- ⏳ Exchange Orders: 导入中
- ⏳ Passengers: 导入中

数据导入完成后，Vercel 部署会自动显示真实数据。

## 🔐 安全提示

- ✅ 数据库连接使用 SSL
- ✅ 使用连接池避免连接耗尽
- ✅ API 路由限制每次查询100条记录
- ✅ 所有敏感信息通过环境变量配置

## 📱 部署完成检查清单

- [ ] DATABASE_URL 环境变量已添加
- [ ] 重新部署已完成
- [ ] 主页可以访问
- [ ] API 路由返回数据（或显示友好错误）
- [ ] 所有页面可以正常加载
- [ ] 无 500 错误

## 🎉 完成！

配置完成后，你的应用就可以正常使用了。数据会在本地导入脚本完成后自动出现在 Vercel 部署中。

---

**需要帮助？**
- 查看 Vercel 部署日志
- 检查浏览器控制台
- 查看 [Vercel 文档](https://vercel.com/docs)
