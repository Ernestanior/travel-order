# 快速开始指南

## 🚀 5分钟快速部署

### 第一步：安装依赖

```bash
cd /Users/ern/Desktop/code/airline-order
npm install
```

### 第二步：本地运行

```bash
npm run dev
```

打开浏览器访问：[http://localhost:3000](http://localhost:3000)

### 第三步：部署到 Vercel

#### 选项 A：使用 Vercel CLI（最快）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

#### 选项 B：通过 GitHub + Vercel 网站

1. **创建 GitHub 仓库并推送代码**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/airline-order.git
git push -u origin main
```

2. **在 Vercel 上部署**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - 点击 "Deploy"
   - 完成！🎉

## 📱 功能演示

系统包含以下模块：

1. **Main Menu（主菜单）** - 系统首页和统计概览
2. **Booking Order（预订订单）** - 管理客户机票预订
3. **Exchange Order（换票订单）** - 管理机票改签
4. **Customer（客户管理）** - 客户信息维护
5. **Supplier（供应商管理）** - 航空公司信息
6. **Reports/Printouts（报表）** - 各种查询和打印功能

## 📂 项目结构

```
airline-order/
├── app/                      # Next.js 页面
│   ├── page.tsx             # 主页
│   ├── booking-orders/      # 预订订单
│   ├── exchange-orders/     # 换票订单
│   ├── customers/           # 客户管理
│   ├── suppliers/           # 供应商管理
│   └── reports/             # 报表
├── lib/mockData.ts          # 模拟数据
├── types/index.ts           # TypeScript 类型
└── README.md                # 详细文档
```

## 🔧 可用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm start        # 运行生产服务器
npm run lint     # 代码检查
```

## 📝 注意事项

- **当前使用模拟数据**：所有数据存储在 `lib/mockData.ts` 中
- **生产环境**：需要连接真实数据库（PostgreSQL, MongoDB 等）
- **功能完整性**：当前版本包含所有UI，部分功能需要后端API支持

## 🎯 下一步

1. ✅ 部署到 Vercel
2. 📧 添加用户认证
3. 💾 连接数据库
4. 🖨️ 实现PDF导出
5. 🔍 增强搜索功能

## 💡 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **部署**: Vercel

## 🆘 需要帮助？

- 查看 [README.md](./README.md) 了解详细文档
- 查看 [DEPLOY.md](./DEPLOY.md) 了解部署详情
- Next.js 文档: [nextjs.org/docs](https://nextjs.org/docs)
- Vercel 文档: [vercel.com/docs](https://vercel.com/docs)

## 📸 系统截图

系统基于你提供的旧系统截图重新设计，包含：
- 订单列表和详情管理
- 客户和供应商信息维护
- 完整的财务记录追踪
- 报表生成功能

祝你使用愉快！🎉
