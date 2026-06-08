# Vercel 环境变量更新指南

## 🚨 重要：必须更新 Vercel 环境变量

本地 `.env` 已经更新为新加坡数据库，但 Vercel 生产环境仍然使用旧的美国数据库。

---

## 快速更新步骤

### 方法 1: 通过 Vercel Dashboard（最简单）

1. **访问项目设置**
   - 登录 https://vercel.com
   - 进入你的项目
   - 点击 **Settings** 选项卡

2. **打开环境变量设置**
   - 在左侧菜单找到 **Environment Variables**
   - 点击进入

3. **更新变量**
   
   找到并编辑以下变量（点击每个变量右侧的 ⋯ 菜单 → Edit）:

   #### DATABASE_URL
   ```
   postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   ```

   #### DATABASE_URL_UNPOOLED
   ```
   postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

   #### POSTGRES_URL
   ```
   postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   ```

   #### POSTGRES_PRISMA_URL
   ```
   postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require
   ```

   #### POSTGRES_URL_NON_POOLING
   ```
   postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   ```

4. **应用到所有环境**
   - 确保勾选: ☑ Production
   - 确保勾选: ☑ Preview
   - 确保勾选: ☑ Development

5. **保存更改**
   - 点击 **Save** 按钮

---

### 方法 2: 通过 Neon Integration（推荐，最安全）

如果你使用了 Neon Integration：

1. **访问 Vercel Integrations**
   - 在 Vercel Dashboard，点击 **Integrations**
   - 找到 **Neon** integration

2. **重新配置**
   - 点击 **Configure**
   - 选择新的新加坡数据库
   - Vercel 会自动更新所有环境变量

3. **完成**
   - 变量会自动更新，无需手动操作

---

## 📝 环境变量对照表

| 变量名 | 旧值（美国） | 新值（新加坡） |
|--------|-------------|---------------|
| 主机 | `ep-little-hat-aq2iyqb1` | `ep-bold-art-aomz20xv` |
| 区域 | `us-east-1` | `ap-southeast-1` |
| 密码 | `npg_mxyoVWE4hF7Y` | `npg_paBHUe5x8Tsb` |

---

## ✅ 验证更新

更新环境变量后：

1. **触发重新部署**
   - 在 Vercel Dashboard，点击 **Deployments**
   - 点击最新部署右侧的 ⋯ 菜单
   - 选择 **Redeploy**

2. **检查日志**
   - 部署完成后，点击查看
   - 确认没有数据库连接错误

3. **测试生产环境**
   - 访问你的生产网站
   - 测试创建/查看订单
   - 检查响应速度（应该明显更快）

---

## 🚨 常见问题

### Q: 我只更新了 DATABASE_URL，其他变量需要更新吗？
A: 建议全部更新，确保所有环境都使用新数据库。

### Q: 更新后需要重新部署吗？
A: 是的，必须重新部署才能使新的环境变量生效。

### Q: Preview 和 Development 环境也要更新吗？
A: 是的，建议所有环境都更新，保持一致。

### Q: 如果忘记更新 Vercel 会怎样？
A: 本地开发正常，但部署到 Vercel 后仍然使用旧的美国数据库，速度依然慢。

---

## 📞 需要帮助？

如果在更新过程中遇到问题：
1. 检查 Vercel 部署日志
2. 确认环境变量格式正确（没有多余空格）
3. 尝试重新部署
4. 查看 Vercel 文档: https://vercel.com/docs/environment-variables

---

## 下一步

更新完环境变量后：
1. ✅ 重新部署项目
2. ✅ 测试生产环境
3. ✅ 等待 24-48 小时确认稳定
4. ✅ 删除旧的美国数据库

---

**记住**: 只有更新了 Vercel 环境变量，生产环境才会使用新的新加坡数据库！
