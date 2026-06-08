#!/bin/bash

# Vercel 环境变量更新脚本
# 使用方法: bash update-vercel-env.sh

echo "🚀 Vercel 环境变量更新脚本"
echo "================================"
echo ""

# 检查是否登录
echo "📝 步骤 1: 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  未登录 Vercel，正在登录..."
    vercel login
else
    echo "✅ 已登录 Vercel"
fi

echo ""
echo "📝 步骤 2: 链接项目到 Vercel..."
if [ ! -d ".vercel" ]; then
    vercel link
else
    echo "✅ 项目已链接"
fi

echo ""
echo "📝 步骤 3: 查看当前环境变量..."
echo ""
vercel env ls
echo ""

echo "⚠️  准备更新环境变量..."
echo "按 Enter 继续，或 Ctrl+C 取消"
read

# 定义新的环境变量
declare -A ENV_VARS=(
    ["DATABASE_URL"]="postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
    ["DATABASE_URL_UNPOOLED"]="postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    ["POSTGRES_URL"]="postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
    ["POSTGRES_PRISMA_URL"]="postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require"
    ["POSTGRES_URL_NON_POOLING"]="postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
    ["ai_gateway_api"]="YOUR_API_KEY_HERE"
)

echo ""
echo "📝 步骤 4: 删除旧的环境变量..."
echo ""

# 需要手动删除的旧变量
OLD_VARS=(
    "PGHOST"
    "PGHOST_UNPOOLED"
    "PGUSER"
    "PGDATABASE"
    "PGPASSWORD"
    "POSTGRES_USER"
    "POSTGRES_HOST"
    "POSTGRES_PASSWORD"
    "POSTGRES_DATABASE"
    "POSTGRES_URL_NO_SSL"
)

for var in "${OLD_VARS[@]}"; do
    echo "🗑️  删除: $var"
    vercel env rm "$var" production -y 2>/dev/null || echo "   (变量不存在或已删除)"
    vercel env rm "$var" preview -y 2>/dev/null || echo "   (变量不存在或已删除)"
    vercel env rm "$var" development -y 2>/dev/null || echo "   (变量不存在或已删除)"
done

echo ""
echo "📝 步骤 5: 添加/更新新的环境变量..."
echo ""

# 添加新变量到所有环境
for var_name in "${!ENV_VARS[@]}"; do
    var_value="${ENV_VARS[$var_name]}"
    echo "➕ 设置: $var_name"
    
    # Production
    echo "$var_value" | vercel env add "$var_name" production
    
    # Preview
    echo "$var_value" | vercel env add "$var_name" preview
    
    # Development
    echo "$var_value" | vercel env add "$var_name" development
    
    echo "   ✅ 完成"
done

echo ""
echo "✅ 所有环境变量已更新！"
echo ""
echo "📝 下一步: 重新部署项目"
echo "   运行: vercel --prod"
echo ""
