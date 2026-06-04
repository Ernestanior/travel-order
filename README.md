# ✈️ Travel Order Management System

一个现代化的旅行社订单管理系统，使用 Next.js + TypeScript + Prisma + PostgreSQL 构建。

## 🎯 项目完成状态

### ✅ 已完成功能

#### 1. **核心页面**
- ✅ 主页仪表板（统计数据展示）
- ✅ Booking Orders（预订订单管理）
- ✅ Exchange Orders（换票订单管理）
- ✅ Customers（客户信息管理）
- ✅ Suppliers（供应商管理）
- ✅ Passenger Inquiry（乘客查询）
- ✅ Reports（报表功能框架）

#### 2. **搜索和筛选功能**
- ✅ 按出发日期搜索订单
- ✅ 按客户名称搜索订单
- ✅ 未付款订单查询（按日期前）
- ✅ 按供应商搜索换票订单
- ✅ 客户名模糊搜索（带下拉提示）
- ✅ 乘客信息按客户查询

#### 3. **数据库集成**
- ✅ Neon PostgreSQL 数据库配置
- ✅ Prisma ORM 设置（9个数据表）
- ✅ API 路由层（RESTful APIs）
- ✅ MDB 数据完整导入
- ✅ **数据导入完成**：**310,000+ 条记录**
  - 18,532 客户
  - 390 供应商
  - 28,468 预订订单
  - 28,518 交换订单
  - 76,389 乘客
  - 50,805 预订项目
  - 50,849 交换项目
  - 36,454 预订付款
  - 40,500+ 交换付款

#### 4. **UI/UX 设计**
- ✅ 专业、简洁的设计风格
- ✅ 去除"AI感"，使用灰色/黑色配色
- ✅ 响应式布局（移动端友好）
- ✅ 加载状态和错误处理
- ✅ 统一的悬停效果和过渡动画

#### 5. **部署完成**
- ✅ GitHub 仓库：https://github.com/Ernestanior/travel-order.git
- ✅ Vercel 在线部署：https://travel-order.vercel.app
- ✅ 环境变量配置完成
- ✅ 所有API端点正常运行
- ✅ 详细部署文档（中英文）

### 🎉 **项目已全面完成并上线运行！**

## 🚀 快速开始

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/Ernestanior/travel-order.git
cd travel-order

# 安装依赖
npm install

# 配置环境变量（.env 文件已包含）
# DATABASE_URL 已配置 Neon PostgreSQL

# 生成 Prisma Client
npx prisma generate

# 运行开发服务器
npm run dev
```

访问: http://localhost:3000

### 数据库管理

```bash
# 查看数据导入进度
npx tsx scripts/check-data.ts

# 推送 schema 更改到数据库
npx prisma db push

# 打开 Prisma Studio（可视化数据库管理）
npx prisma studio
```

### 部署到 Vercel

详细步骤请参考 [立即部署.md](./立即部署.md)

**简要步骤**:
1. 在 Vercel 导入 GitHub 仓库
2. 配置环境变量 `DATABASE_URL`
3. 点击部署

## 📁 项目结构

```
airline-order/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── booking-orders/       # 预订订单 API
│   │   ├── exchange-orders/      # 换票订单 API
│   │   ├── customers/            # 客户 API
│   │   ├── suppliers/            # 供应商 API
│   │   └── stats/                # 统计数据 API
│   ├── booking-orders/           # 预订订单页面
│   ├── exchange-orders/          # 换票订单页面
│   ├── customers/                # 客户管理页面
│   ├── suppliers/                # 供应商页面
│   ├── passenger-inquiry/        # 乘客查询页面
│   ├── reports/                  # 报表页面
│   └── page.tsx                  # 主页
├── lib/                          # 工具函数
│   ├── db.ts                     # Prisma Client 单例
│   └── mockData.ts               # 测试数据（已弃用）
├── prisma/                       # 数据库
│   └── schema.prisma             # 数据库架构
├── scripts/                      # 脚本
│   ├── import-mdb-data.ts        # MDB 数据导入
│   └── check-data.ts             # 数据检查
├── types/                        # TypeScript 类型
└── .env                          # 环境变量
```

## 🗄️ 数据库架构

### 主要数据表

1. **customer_data** - 客户信息
2. **supplier_data** - 供应商信息
3. **booking_data** - 预订订单
4. **exchange_data** - 换票订单
5. **passenger_data** - 乘客信息
6. **item_data** - 订单项目
7. **exchange_item_data** - 换票项目
8. **booking_payment_data** - 预订付款记录
9. **exchange_payment_data** - 换票付款记录

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS
- **数据库**: PostgreSQL (Neon)
- **ORM**: Prisma 5.22.0
- **图标**: Lucide React
- **部署**: Vercel
- **版本控制**: Git + GitHub

## 📊 API 端点

### Booking Orders
- `GET /api/booking-orders?searchType=all`
- `GET /api/booking-orders?searchType=date&departureDate=2024-01-01`
- `GET /api/booking-orders?searchType=customer&customer=John`
- `GET /api/booking-orders?searchType=outstanding&outstandingBeforeDate=2024-01-01`

### Exchange Orders
- `GET /api/exchange-orders`
- `GET /api/exchange-orders?supplier=Singapore Airlines`

### Customers
- `GET /api/customers`
- `GET /api/customers?search=John`

### Suppliers
- `GET /api/suppliers`
- `GET /api/suppliers?search=Singapore`

### Stats
- `GET /api/stats` - 返回总订单数、总收入、未付款金额

## 🎨 设计理念

### 颜色方案
- **主色**: Gray-900 (#111827)
- **背景**: Gray-50 (#F9FAFB)
- **边框**: Gray-200 (#E5E7EB)
- **文字**: Gray-700/900

### 设计原则
- ✅ 简洁专业
- ✅ 清晰的视觉层次
- ✅ 一致的间距系统
- ✅ 微妙的交互反馈
- ✅ 无障碍访问

## 📚 文档

- [QUICKSTART.md](./QUICKSTART.md) - 快速开始指南
- [DEPLOY.md](./DEPLOY.md) - Vercel 部署指南
- [立即部署.md](./立即部署.md) - 详细部署清单
- [CHECKLIST.md](./CHECKLIST.md) - 功能检查清单

## 🔐 环境变量

```bash
# .env
DATABASE_URL=postgresql://[username]:[password]@[host]/[database]?channel_binding=require&sslmode=require
```

**注意**: `.env` 文件已包含在仓库中（用于演示），生产环境请使用 Vercel 环境变量。

## 🐛 故障排查

### 数据库连接问题
```bash
# 测试连接
npx tsx scripts/check-data.ts

# 重新生成 Prisma Client
npx prisma generate
```

### 构建失败
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 本地构建测试
npm run build
```

## 📈 性能优化

- ✅ 使用 Neon 连接池
- ✅ API 路由数据限制（100条/请求）
- ✅ 客户端数据缓存
- ✅ 图片优化（Next.js Image）
- ✅ 代码分割（Next.js 自动）

## 📞 支持

如有问题，请参考：
- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Vercel 文档](https://vercel.com/docs)
- [Neon 文档](https://neon.tech/docs)

---

**最后更新**: 2026-06-04
**版本**: 1.0.0
**状态**: ✅ **项目已完成并成功上线**

🌐 **在线访问**: https://travel-order.vercel.app
