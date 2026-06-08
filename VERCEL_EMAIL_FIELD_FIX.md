# Vercel Email 字段错误修复指南

## 🐛 问题
Vercel 生产环境报错：
```
The column `customer_data.email` does not exist in the current database.
```

但是：
- ✅ 本地测试环境正常
- ✅ 数据库中确实有 email 字段
- ✅ 代码已推送到 Git

## 🔍 原因
Vercel 的环境变量配置可能有问题，或者连接到了错误的数据库。

---

## ✅ 解决方案

### 步骤 1：登录 Vercel Dashboard

访问：https://vercel.com

### 步骤 2：进入项目设置

1. 选择你的项目
2. 点击顶部的 **Settings** 标签
3. 在左侧菜单选择 **Environment Variables**

### 步骤 3：检查并更新数据库连接

**需要更新的环境变量（5个）：**

#### 1. `DATABASE_URL`
**应该设置为：**
```
postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

#### 2. `DATABASE_URL_UNPOOLED`
**应该设置为：**
```
postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

#### 3. `POSTGRES_URL`
**应该设置为：**
```
postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

#### 4. `POSTGRES_URL_NON_POOLING`
**应该设置为：**
```
postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

#### 5. `POSTGRES_PRISMA_URL`
**应该设置为：**
```
postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require
```

---

### 步骤 4：确认关键信息

所有数据库连接都应该包含：
- ✅ 主机：`ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech`
- ✅ 区域：`ap-southeast-1` （新加坡）
- ✅ 密码：`npg_paBHUe5x8Tsb`

**如果看到以下内容，说明配置错误：**
- ❌ `us-east-1` （美国旧数据库）
- ❌ `ep-little-hat-aq2iyqb1` （旧数据库主机）
- ❌ `npg_mxyoVWE4hF7Y` （旧密码）

---

### 步骤 5：更新环境变量的方法

#### 方法 A：在 Vercel UI 中更新

1. 找到每个变量，点击右侧的 "..." 菜单
2. 选择 **Edit**
3. 粘贴新的值
4. 确保勾选 **Production**、**Preview**、**Development** 三个环境
5. 点击 **Save**

#### 方法 B：删除旧的，添加新的

1. 点击每个旧变量右侧的 "..." 菜单
2. 选择 **Remove**
3. 点击 **Add New** 按钮
4. 输入变量名和新值
5. 勾选所有环境（Production, Preview, Development）
6. 点击 **Save**

---

### 步骤 6：重新部署

**更新环境变量后必须重新部署！**

#### 方法 A：通过 Git 推送（推荐）
```bash
git commit --allow-empty -m "chore: Trigger redeploy after env update"
git push origin main
```

#### 方法 B：手动重新部署
1. 在 Vercel Dashboard 点击顶部的 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的 "..." 菜单
4. 选择 **Redeploy**
5. 勾选 **Use existing Build Cache** 可以取消（确保重新构建）
6. 点击 **Redeploy** 按钮

---

### 步骤 7：等待部署完成

1. 在 **Deployments** 页面查看部署状态
2. 等待状态变为 **Ready**（通常 1-3 分钟）
3. 点击部署查看构建日志，确认没有错误

---

### 步骤 8：测试

部署完成后，访问：
```
https://你的域名.vercel.app/api/booking-orders/29536
```

应该可以正常返回数据，不再报错！

---

## 🔧 如果还是不行

### 调试步骤 1：检查部署日志

1. 进入 **Deployments** → 点击最新部署
2. 查看 **Building** 阶段的日志
3. 搜索 `prisma generate` 确认 Prisma Client 已重新生成

### 调试步骤 2：使用诊断端点

访问刚才部署的管理端点：
```
https://你的域名.vercel.app/api/admin/add-email-column
```

使用 POST 请求：
```bash
curl -X POST https://你的域名.vercel.app/api/admin/add-email-column
```

这会显示 Vercel 连接的数据库中有哪些字段。

### 调试步骤 3：查看运行时日志

1. 在 Vercel Dashboard 进入项目
2. 点击顶部的 **Logs** 标签
3. 选择 **Runtime Logs**
4. 访问报错的接口，查看实时错误信息

---

## 📋 检查清单

在 Vercel Dashboard 确认：

- [ ] `DATABASE_URL` 包含 `ap-southeast-1`（新加坡）
- [ ] `DATABASE_URL` 包含 `ep-bold-art-aomz20xv`（新数据库）
- [ ] `DATABASE_URL` 包含 `npg_paBHUe5x8Tsb`（新密码）
- [ ] 所有 5 个数据库环境变量都已更新
- [ ] 环境变量应用到 Production 环境
- [ ] 已触发重新部署
- [ ] 部署状态为 Ready
- [ ] 测试接口不再报错

---

## 💡 重要提示

1. **必须重新部署**：更新环境变量后不会自动生效，必须手动触发部署
2. **清除缓存**：建议在 Redeploy 时不勾选 "Use existing Build Cache"
3. **等待时间**：环境变量更新可能需要几秒钟才生效，重新部署需要 1-3 分钟

---

## ✅ 成功标志

修复成功后：
- ✅ 订单详情接口正常返回
- ✅ 不再报错 "email does not exist"
- ✅ 可以在订单中看到 email 字段
- ✅ Make Payment 功能正常工作

---

**祝你好运！如果还有问题，请截图 Vercel 的环境变量配置页面。** 🚀
