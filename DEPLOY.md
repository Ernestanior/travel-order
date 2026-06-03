# 部署到 Vercel 指南

## 方法一：通过 Vercel 网站部署（推荐）

### 1. 准备代码

首先将代码推送到 Git 仓库（GitHub, GitLab 或 Bitbucket）：

```bash
# 初始化 git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Travel agency order management system"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/airline-order.git

# 推送到远程仓库
git push -u origin main
```

### 2. 在 Vercel 上部署

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub/GitLab/Bitbucket 账号登录
3. 点击 "Add New" → "Project"
4. 导入你的 Git 仓库
5. Vercel 会自动检测到这是一个 Next.js 项目
6. 点击 "Deploy"

就这么简单！Vercel 会自动：
- 安装依赖
- 构建项目
- 部署到生产环境
- 提供一个 `.vercel.app` 域名

### 3. 自定义域名（可选）

1. 在 Vercel 项目设置中，进入 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

## 方法二：使用 Vercel CLI

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录

```bash
vercel login
```

### 3. 部署

在项目根目录运行：

```bash
vercel
```

首次部署时会询问一些配置问题，可以使用默认设置。

### 4. 部署到生产环境

```bash
vercel --prod
```

## 环境变量配置

如果你的应用需要环境变量：

1. 在 Vercel 项目设置中，进入 "Environment Variables"
2. 添加需要的环境变量
3. 重新部署项目

或使用 CLI：

```bash
vercel env add
```

## 自动部署

连接 Git 仓库后，每次推送代码到主分支，Vercel 会自动：
- 构建新版本
- 运行测试（如果配置了）
- 部署到生产环境

预览分支：
- 推送到其他分支会创建预览部署
- 每个 Pull Request 都会获得唯一的预览 URL

## 构建配置

Vercel 会自动检测 `package.json` 中的构建命令：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

## 性能优化建议

1. **图片优化**: 使用 Next.js `<Image>` 组件
2. **代码分割**: Next.js 自动处理
3. **缓存策略**: Vercel 自动配置 CDN
4. **分析包大小**: 
   ```bash
   npm install -g @next/bundle-analyzer
   ```

## 监控和分析

Vercel 提供内置的：
- 性能分析
- 错误跟踪
- 访问统计
- Web Vitals 监控

可在项目仪表板中查看。

## 回滚

如果新版本有问题，可以快速回滚：

1. 进入 Vercel 项目仪表板
2. 点击 "Deployments"
3. 找到之前的稳定版本
4. 点击 "Promote to Production"

## 成本

- **Hobby 计划**（免费）：
  - 无限项目
  - 100GB 带宽/月
  - 适合个人项目和小型应用

- **Pro 计划**（$20/月）：
  - 1TB 带宽
  - 高级分析
  - 密码保护
  - 适合商业项目

查看详细定价：[vercel.com/pricing](https://vercel.com/pricing)

## 故障排查

### 构建失败

查看构建日志：
```bash
vercel logs
```

### 本地测试生产构建

```bash
npm run build
npm start
```

### 常见问题

1. **依赖安装失败**: 检查 `package.json` 版本兼容性
2. **环境变量问题**: 确保在 Vercel 中正确设置
3. **路由 404**: 检查 `next.config.js` 配置

## 数据库连接（未来）

当你准备连接数据库时：

1. 选择数据库提供商（Vercel Postgres, Supabase, PlanetScale 等）
2. 在 Vercel 中添加数据库环境变量
3. 更新代码以使用真实数据库
4. 重新部署

## 支持

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)
