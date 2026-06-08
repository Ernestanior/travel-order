# Vercel 环境变量手动更新指南

## 🎯 目标
1. 删除旧的美国数据库相关变量
2. 保留并更新新加坡数据库变量
3. 添加 ai_gateway_api 变量
4. 简化环境变量（只保留必要的）

---

## 📋 步骤 1: 登录 Vercel Dashboard

1. 访问 https://vercel.com
2. 登录你的账户
3. 找到你的 `airline-order` 项目
4. 点击进入项目

---

## 📋 步骤 2: 打开环境变量设置

1. 点击顶部的 **Settings** 选项卡
2. 在左侧菜单找到 **Environment Variables**
3. 点击进入

---

## 📋 步骤 3: 删除不需要的旧变量

找到并**删除**以下变量（如果存在）：

### ❌ 需要删除的变量：
- `PGHOST`
- `PGHOST_UNPOOLED`
- `PGUSER`
- `PGDATABASE`
- `PGPASSWORD`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `POSTGRES_URL_NO_SSL`

**操作**: 点击每个变量右侧的 **⋯** 菜单 → 选择 **Delete** → 确认删除

---

## 📋 步骤 4: 更新/添加新的环境变量

### ✅ 需要保留并更新的变量：

#### 1. DATABASE_URL
**删除旧的**，然后**添加新的**：
```
postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```
**环境**: ☑ Production ☑ Preview ☑ Development

---

#### 2. DATABASE_URL_UNPOOLED
**删除旧的**，然后**添加新的**：
```
postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```
**环境**: ☑ Production ☑ Preview ☑ Development

---

#### 3. POSTGRES_URL
**删除旧的**，然后**添加新的**：
```
postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```
**环境**: ☑ Production ☑ Preview ☑ Development

---

#### 4. POSTGRES_PRISMA_URL
**删除旧的**，然后**添加新的**：
```
postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require
```
**环境**: ☑ Production ☑ Preview ☑ Development

---

#### 5. POSTGRES_URL_NON_POOLING
**删除旧的**，然后**添加新的**：
```
postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```
**环境**: ☑ Production ☑ Preview ☑ Development

---

#### 6. ai_gateway_api ⭐ 新增
**添加新变量**：
```
your_ai_gateway_api_key_here
```
**环境**: ☑ Production ☑ Preview ☑ Development

---

## 📋 步骤 5: 确认最终的环境变量列表

完成后，你应该只有以下 **6 个环境变量**：

1. ✅ `DATABASE_URL` - 主连接字符串（新加坡）
2. ✅ `DATABASE_URL_UNPOOLED` - 非池化连接（新加坡）
3. ✅ `POSTGRES_URL` - Postgres URL（新加坡）
4. ✅ `POSTGRES_PRISMA_URL` - Prisma 连接（新加坡）
5. ✅ `POSTGRES_URL_NON_POOLING` - 非池化 URL（新加坡）
6. ✅ `ai_gateway_api` - AI Gateway API Key

---

## 📋 步骤 6: 触发重新部署

### 方法 A: 通过 Dashboard
1. 在 Vercel 项目页面，点击 **Deployments** 选项卡
2. 找到最新的部署
3. 点击右侧的 **⋯** 菜单
4. 选择 **Redeploy**
5. 确认重新部署

### 方法 B: 通过 Git 推送
```bash
git add .
git commit -m "Update database to Singapore region"
git push
```

### 方法 C: 通过 CLI（推荐，如果已登录）
```bash
vercel --prod
```

---

## ✅ 验证部署

1. **等待部署完成** （通常 1-2 分钟）

2. **检查部署日志**
   - 点击部署查看日志
   - 确认没有数据库连接错误

3. **访问生产网站**
   - 打开你的生产网站
   - 测试以下功能：
     - 查看订单列表
     - 查看订单详情
     - 创建新订单
     - 编辑订单

4. **检查性能**
   - 打开浏览器开发者工具（F12）
   - 切换到 Network 选项卡
   - 刷新页面，查看 API 请求时间
   - **预期**: API 响应从 4-6 秒降低到 1-2 秒

---

## 🚨 如果出现问题

### 问题 1: 数据库连接错误
**解决方案**: 
- 检查环境变量拼写是否正确
- 确保没有多余的空格或换行
- 重新部署

### 问题 2: 仍然很慢
**检查**:
- 确认所有环境变量都已更新
- 确认已重新部署
- 检查 Vercel 部署日志确认使用的是新数据库

### 问题 3: 找不到数据
**原因**: 可能还在使用旧数据库
**解决方案**: 
- 再次检查环境变量
- 强制重新部署

---

## 📸 截图参考

### 删除变量
1. 找到变量
2. 点击右侧 **⋯**
3. 点击 **Delete**
4. 确认删除

### 添加/编辑变量
1. 点击 **Add New**（新增）或 **Edit**（编辑）
2. 输入变量名
3. 粘贴变量值
4. 勾选所有环境：Production、Preview、Development
5. 点击 **Save**

---

## 🎯 成功标志

✅ 只有 6 个环境变量  
✅ 所有变量都指向新加坡数据库（`ap-southeast-1`）  
✅ 成功重新部署  
✅ 网站正常访问  
✅ API 响应速度明显加快  
✅ 数据显示正常  

---

## ⏱️ 预计耗时

- 删除旧变量: 2-3 分钟
- 添加新变量: 3-5 分钟
- 重新部署: 1-2 分钟
- **总计**: 约 10 分钟

---

## 📞 需要帮助？

如果遇到问题，请截图以下内容：
1. Vercel 环境变量列表
2. 部署日志中的错误信息
3. 浏览器控制台的错误信息

---

**准备好了吗？开始更新吧！** 🚀
