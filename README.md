# ✈️ Travel Order Management System

一个现代化的旅行社订单管理系统，使用 Next.js + TypeScript + Prisma + PostgreSQL 构建。

## 🎯 主要功能

- ✅ **登录认证** - 账号密码登录系统（硬编码账号）
- ✅ **Booking Orders** - 预订订单管理（CRUD + 付款记录 + PDF 导出）
- ✅ **Exchange Orders** - 换票订单管理（CRUD + 付款记录 + PDF 导出）
- ✅ **Customers** - 客户信息管理
- ✅ **Suppliers** - 供应商（航空公司）管理
- ✅ **Payment Receipts** - 付款收据查看和打印
- ✅ **Reports** - 各类报表功能

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量（.env 文件）
DATABASE_URL="你的数据库连接字符串"

# 生成 Prisma Client
npx prisma generate

# 运行开发服务器
npm run dev
```

访问: http://localhost:3000

### 登录信息

系统需要登录才能访问。账号信息请查看 `SYSTEM_CREDENTIALS.md` 文件。

## 📁 项目结构

```
airline-order/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   ├── login/                    # 登录页面
│   ├── booking-orders/           # 预订订单页面
│   ├── exchange-orders/          # 换票订单页面
│   ├── customers/                # 客户管理页面
│   ├── suppliers/                # 供应商页面
│   ├── receipts/                 # 收据页面
│   ├── reports/                  # 报表页面
│   └── page.tsx                  # 主页
├── lib/                          # 工具函数
│   ├── db.ts                     # Prisma Client
│   ├── pdfGenerator.ts           # PDF 生成
│   ├── formatUtils.ts            # 格式化工具
│   └── dateUtils.ts              # 日期工具
├── prisma/                       # 数据库
│   └── schema.prisma             # 数据库架构
├── middleware.ts                 # 路由保护中间件
└── SYSTEM_CREDENTIALS.md         # 系统凭证信息（重要！）
```

## 🗄️ 数据库

使用 PostgreSQL 数据库，包含以下主要数据表：

- **customer_data** - 客户信息
- **supplier_data** - 供应商信息
- **booking_data** - 预订订单
- **exchange_data** - 换票订单
- **passenger_data** - 乘客信息
- **item_data** - 订单项目
- **booking_payment_data** - 预订付款记录
- **exchange_payment_data** - 换票付款记录

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **PDF**: jsPDF + jspdf-autotable
- **通知**: Ant Design
- **字体**: Noto Sans SC (中文支持)

## 🎨 UI 设计

基于 [taste-skill](https://github.com/leonxlnx/taste-skill) 设计原则：

- **颜色**: Zinc 色系（zinc-50/100/200/900）
- **字体**: 精确字体大小（[13px], [14px], [15px] 等）
- **圆角**: 统一使用 rounded-lg/xl
- **动画**: 微妙的 hover 和 active 状态
- **布局**: 非对称、现代化设计

## 🔐 安全特性

- ✅ 登录认证（Session Cookie）
- ✅ 路由保护（Middleware）
- ✅ HTTP-only Cookie
- ✅ Item 删除密码保护

## 📚 重要文档

- **SYSTEM_CREDENTIALS.md** - 系统账号密码信息（请妥善保管）
- **README.md** - 本文档

## 🐛 故障排查

### 数据库连接问题
```bash
# 测试数据库连接
npx tsx scripts/check-data.ts

# 重新生成 Prisma Client
npx prisma generate
```

### 构建问题
```bash
# 清理并重新安装
rm -rf node_modules .next
npm install
npm run build
```

## 📞 部署

项目可以部署到 Vercel 或任何支持 Next.js 的平台。

**环境变量**:
```bash
DATABASE_URL=你的PostgreSQL连接字符串
NODE_ENV=production
```

---

**版本**: 2.0.0  
**最后更新**: 2026-07-06  
**状态**: ✅ 生产就绪
