#!/bin/bash

###############################################
# 部署验证脚本
# 用途：验证订单序列号功能是否正常工作
###############################################

echo "🔍 开始验证部署..."
echo "========================================="
echo ""

# 1. 检查数据库序列
echo "📊 步骤1: 检查数据库序列"
echo "----------------------------------------"

if command -v npx &> /dev/null; then
    SEQUENCE_CHECK=$(npx tsx -e "
        import { PrismaClient } from '@prisma/client';
        const prisma = new PrismaClient();
        (async () => {
            try {
                const result = await prisma.\$queryRaw\`SELECT last_value FROM booking_number_seq\`;
                console.log('✅ 序列存在，当前值:', result[0].last_value);
            } catch (error) {
                console.log('❌ 序列不存在');
            }
            await prisma.\$disconnect();
        })();
    " 2>&1)
    echo "$SEQUENCE_CHECK"
else
    echo "⚠️  npx 未安装，跳过本地检查"
fi

echo ""

# 2. 检查Git状态
echo "📦 步骤2: 检查Git状态"
echo "----------------------------------------"

GIT_STATUS=$(git status --short 2>&1)
if [ -z "$GIT_STATUS" ]; then
    echo "✅ 工作区干净，所有更改已提交"
else
    echo "⚠️  工作区有未提交的更改:"
    echo "$GIT_STATUS"
fi

echo ""

# 3. 检查最新Commit
echo "📝 步骤3: 检查最新Commit"
echo "----------------------------------------"

LATEST_COMMIT=$(git log -1 --oneline 2>&1)
echo "最新提交: $LATEST_COMMIT"

if echo "$LATEST_COMMIT" | grep -q "sequential booking"; then
    echo "✅ 最新提交包含序列号功能"
else
    echo "⚠️  最新提交可能不是序列号功能"
fi

echo ""

# 4. 检查远程状态
echo "🌐 步骤4: 检查远程同步状态"
echo "----------------------------------------"

git fetch origin main --quiet 2>&1

LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo "✅ 本地和远程已同步"
    echo "   Commit: $LOCAL_COMMIT"
else
    echo "⚠️  本地和远程不同步"
    echo "   本地: $LOCAL_COMMIT"
    echo "   远程: $REMOTE_COMMIT"
fi

echo ""

# 5. 检查关键文件
echo "📄 步骤5: 检查关键文件"
echo "----------------------------------------"

FILES=(
    "app/api/booking-orders/create/route.ts"
    "scripts/setup-sequence.ts"
    "BOOKING_SEQUENCE_SOLUTION.md"
    "QUICK_SETUP_SEQUENCE.md"
    "test-concurrent-booking.sh"
    "DEPLOYMENT_COMPLETE.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (缺失)"
    fi
done

echo ""

# 6. 生成测试命令
echo "🧪 步骤6: 生成测试命令"
echo "----------------------------------------"
echo ""
echo "请在Vercel部署完成后执行以下测试："
echo ""
echo "1️⃣ 测试生产环境API:"
echo "   curl -X POST https://travel-order.vercel.app/api/booking-orders/create \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"customerName\":\"Test\",\"tel\":\"12345678\",\"tourCode\":\"TEST\",\"items\":[{\"item\":\"Test\",\"quantity\":1,\"unitPrice\":100,\"price\":100}]}'"
echo ""
echo "2️⃣ 并发测试:"
echo "   ./test-concurrent-booking.sh https://travel-order.vercel.app/api/booking-orders/create"
echo ""
echo "3️⃣ 查看最新订单:"
echo "   访问: https://travel-order.vercel.app/booking-orders"
echo ""

# 7. 总结
echo "========================================="
echo "📋 验证总结"
echo "========================================="
echo ""

# 统计检查项
PASS_COUNT=0
WARN_COUNT=0

# 简单的检查（实际项目中可以更复杂）
if [ -f "app/api/booking-orders/create/route.ts" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
fi

if [ -z "$GIT_STATUS" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
fi

if echo "$LATEST_COMMIT" | grep -q "sequential"; then
    PASS_COUNT=$((PASS_COUNT + 1))
fi

echo "✅ 检查通过: $PASS_COUNT 项"
echo "⚠️  需要注意: $WARN_COUNT 项"
echo ""

# 8. 下一步操作
echo "🎯 下一步操作:"
echo "----------------------------------------"
echo "1. 访问 Vercel Dashboard: https://vercel.com/dashboard"
echo "2. 检查部署状态（预计2-3分钟）"
echo "3. 部署完成后执行上述测试命令"
echo "4. 通知客户进行验收测试"
echo ""

echo "========================================="
echo "✨ 验证完成！"
echo "========================================="

exit 0
