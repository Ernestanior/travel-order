# 旅行社订单管理系统

这是一个基于 Next.js 和 TypeScript 开发的旅行社订单管理系统，用于管理机票预订、换票订单、客户和供应商信息。

## 功能模块

### 1. Booking Order（预订订单）
- 查看和管理所有预订订单
- 订单详情包括：
  - 客户信息（姓名、地址、电话、传真）
  - 航班信息（出发/到达日期、时间、航班号、目的地）
  - 乘客数据
  - 支付记录和收据
  - 特殊说明

### 2. Exchange Order（换票订单）
- 管理机票改签/换票订单
- 包含供应商信息
- 追踪换票费用和支付状态

### 3. Customer（客户管理）
- 客户信息维护
- 联系方式管理

### 4. Supplier（供应商管理）
- 航空公司和供应商信息
- 联系方式管理

### 5. Reports / Printouts（报表打印）
- 预订查询（按出发日期）
- 换票查询（按供应商）
- 未付款交易报表
- 收据查询和打印
- 利润报表
- 按客户查询
- 已关闭预订交易

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React

## 开始使用

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 3. 构建生产版本

```bash
npm run build
```

### 4. 启动生产服务器

```bash
npm start
```

## 部署到 Vercel

这个项目可以轻松部署到 Vercel：

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. Vercel 会自动检测 Next.js 项目并配置构建设置
4. 点击部署

或者使用 Vercel CLI：

```bash
npm install -g vercel
vercel
```

## 项目结构

```
airline-order/
├── app/                      # Next.js App Router 页面
│   ├── page.tsx             # 主页（Main Menu）
│   ├── booking-orders/      # 预订订单
│   │   ├── page.tsx        # 订单列表
│   │   └── [id]/           # 订单详情
│   ├── exchange-orders/     # 换票订单
│   ├── customers/           # 客户管理
│   ├── suppliers/           # 供应商管理
│   ├── reports/             # 报表
│   ├── layout.tsx          # 根布局
│   └── globals.css         # 全局样式
├── lib/                     # 工具函数和数据
│   └── mockData.ts         # 模拟数据
├── types/                   # TypeScript 类型定义
│   └── index.ts
├── public/                  # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 数据结构

### BookingOrder（预订订单）
- 订单号、日期、状态
- 客户信息
- 航班信息（支持多段航班）
- 乘客列表
- 财务信息（总额、已付、未付）
- 收据记录

### ExchangeOrder（换票订单）
- 换票号、关联预订号
- 供应商信息
- 航班变更信息
- 换票费用明细

### Customer（客户）
- 基本信息和联系方式

### Supplier（供应商）
- 供应商名称、联系方式、地址

## 后续开发建议

1. **数据库集成**: 替换模拟数据，连接实际数据库（如 PostgreSQL, MongoDB）
2. **用户认证**: 添加登录系统
3. **API 路由**: 创建 API 端点处理数据 CRUD 操作
4. **PDF 生成**: 实现发票和报表的 PDF 导出
5. **搜索和筛选**: 增强订单搜索和筛选功能
6. **数据验证**: 添加表单验证
7. **状态管理**: 使用 Zustand 或 Redux 管理复杂状态
8. **国际化**: 支持多语言

## 注意事项

- 当前使用模拟数据，实际部署时需要连接数据库
- 打印功能需要进一步开发
- 支付功能需要集成支付网关
- 建议添加用户权限管理

## License

MIT
