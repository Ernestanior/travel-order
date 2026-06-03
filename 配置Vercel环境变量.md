# 🔧 立即配置 Vercel 环境变量

## ⚠️ 当前状态

您的代码已成功推送到 GitHub，但 **Vercel 部署需要配置数据库环境变量**。

## 🎯 立即操作步骤

### 步骤 1：打开 Vercel 项目设置

1. 访问：https://vercel.com/dashboard
2. 找到你的项目 `travel-order`
3. 点击 **Settings**（设置）
4. 点击左侧菜单的 **Environment Variables**（环境变量）

### 步骤 2：添加数据库 URL

点击 **"Add New"** 按钮，然后添加：

**Name（变量名）**:
```
DATABASE_URL
```

**Value（变量值）** - 复制以下完整内容：
```
postgresql://neondb_owner:npg_mxyoVWE4hF7Y@ep-little-hat-aq2iyqb1-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

**Environment（环境）** - 全部勾选：
- ☑️ Production
- ☑️ Preview  
- ☑️ Development

然后点击 **Save**（保存）

### 步骤 3：重新部署

**方式 A - 在 Vercel Dashboard 中**：
1. 进入 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的三个点 `...` 菜单
4. 选择 **"Redeploy"**（重新部署）
5. 确认重新部署

**方式 B - 推送空提交触发**：
```bash
cd /Users/ern/Desktop/code/airline-order
git commit --allow-empty -m "配置环境变量后重新部署"
git push origin main
```

## ✅ 验证部署成功

等待 2-3 分钟后，访问你的 Vercel URL：

### 应该看到：
- ✅ 主页加载成功（显示统计数据或0）
- ✅ 可以访问各个页面
- ✅ 页面不显示 "Database not configured" 错误

### 如果数据为空：
这是正常的！因为：
- ⏳ 本地数据导入还在进行中（当前：7,243条客户已导入）
- ⏳ 数据会自动同步到 Neon 数据库
- ⏳ 完成后 Vercel 就会显示真实数据

## 📊 检查数据导入进度

在本地运行：
```bash
cd /Users/ern/Desktop/code/airline-order
npx tsx scripts/check-data.ts
```

## 🎉 完成！

配置环境变量并重新部署后，你的应用就完全可用了！

---

**有问题？**
- 查看 `VERCEL_SETUP.md` 获取详细故障排查指南
- 检查 Vercel 部署日志
- 确认环境变量已正确保存
