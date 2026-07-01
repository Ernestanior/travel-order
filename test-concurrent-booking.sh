#!/bin/bash

###############################################
# Booking Order 并发创建测试脚本
# 用途：测试多个订单同时创建时的顺序性和唯一性
###############################################

echo "🧪 开始测试并发创建 Booking Order"
echo "========================================="
echo ""

# 配置
API_URL="${1:-http://localhost:3000/api/booking-orders/create}"
CONCURRENT_REQUESTS=5

echo "📍 API 地址: $API_URL"
echo "🔢 并发数量: $CONCURRENT_REQUESTS"
echo ""

# 创建临时目录存储结果
TEMP_DIR="/tmp/booking-test-$(date +%s)"
mkdir -p "$TEMP_DIR"

echo "⏳ 正在发送 $CONCURRENT_REQUESTS 个并发请求..."
echo ""

# 并发发送请求
for i in $(seq 1 $CONCURRENT_REQUESTS); do
  (
    RESULT=$(curl -s -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"customerName\": \"Test Customer $i\",
        \"tel\": \"1234567$i\",
        \"email\": \"test$i@example.com\",
        \"address\": \"Test Address $i\",
        \"bookingDate\": \"2026-07-01\",
        \"departureDate\": \"2026-07-15\",
        \"tourCode\": \"TEST$i\",
        \"tour\": \"Test Tour $i\",
        \"staff\": \"TestStaff\",
        \"items\": [
          {
            \"item\": \"Air Ticket\",
            \"quantity\": 1,
            \"unitPrice\": 100,
            \"price\": 100
          }
        ],
        \"passengers\": [
          {
            \"name\": \"Passenger $i\",
            \"passport\": \"P123456$i\",
            \"birthdate\": \"1990-01-01\",
            \"passportExpiryDate\": \"2030-01-01\"
          }
        ]
      }")
    
    echo "$RESULT" > "$TEMP_DIR/result_$i.json"
    
    # 提取订单号
    BOOKING_NO=$(echo "$RESULT" | grep -o '"bookingNumber":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$BOOKING_NO" ]; then
      echo "✅ 请求 #$i: $BOOKING_NO"
    else
      echo "❌ 请求 #$i: 失败"
      echo "   错误: $(echo "$RESULT" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)"
    fi
  ) &
done

# 等待所有请求完成
wait

echo ""
echo "========================================="
echo "📊 测试结果分析"
echo "========================================="
echo ""

# 收集所有订单号
BOOKING_NUMBERS=$(cat "$TEMP_DIR"/result_*.json | grep -o '"bookingNumber":"T[0-9]*"' | cut -d'"' -f4 | sort)

# 统计
TOTAL=$(echo "$BOOKING_NUMBERS" | grep -c "T")
UNIQUE=$(echo "$BOOKING_NUMBERS" | sort -u | wc -l | tr -d ' ')

echo "📋 创建的订单号："
echo "$BOOKING_NUMBERS" | nl
echo ""

echo "📈 统计信息："
echo "   总请求数: $CONCURRENT_REQUESTS"
echo "   成功数: $TOTAL"
echo "   唯一数: $UNIQUE"
echo ""

# 检查结果
if [ "$TOTAL" -eq "$CONCURRENT_REQUESTS" ] && [ "$UNIQUE" -eq "$TOTAL" ]; then
  echo "✅ 测试通过！"
  echo "   ✓ 所有订单创建成功"
  echo "   ✓ 订单号全部唯一"
  echo "   ✓ 无冲突发生"
else
  echo "❌ 测试失败！"
  [ "$TOTAL" -lt "$CONCURRENT_REQUESTS" ] && echo "   ✗ 部分请求失败"
  [ "$UNIQUE" -lt "$TOTAL" ] && echo "   ✗ 发现重复订单号"
fi

echo ""

# 检查顺序性
FIRST_NUM=$(echo "$BOOKING_NUMBERS" | head -1 | sed 's/T//')
LAST_NUM=$(echo "$BOOKING_NUMBERS" | tail -1 | sed 's/T//')

if [ -n "$FIRST_NUM" ] && [ -n "$LAST_NUM" ]; then
  RANGE=$((LAST_NUM - FIRST_NUM + 1))
  
  echo "📏 顺序性检查："
  echo "   起始订单号: T$FIRST_NUM"
  echo "   结束订单号: T$LAST_NUM"
  echo "   理论范围: $RANGE 个号码"
  echo "   实际创建: $TOTAL 个订单"
  
  if [ "$RANGE" -eq "$TOTAL" ]; then
    echo "   ✅ 订单号连续，无跳号"
  else
    echo "   ⚠️  订单号不连续（可能有其他并发创建）"
  fi
fi

echo ""

# 显示详细结果
echo "📄 详细结果（JSON）："
for i in $(seq 1 $CONCURRENT_REQUESTS); do
  if [ -f "$TEMP_DIR/result_$i.json" ]; then
    echo "   请求 #$i:"
    cat "$TEMP_DIR/result_$i.json" | python3 -m json.tool 2>/dev/null || cat "$TEMP_DIR/result_$i.json"
    echo ""
  fi
done

# 清理
rm -rf "$TEMP_DIR"

echo "========================================="
echo "✨ 测试完成！"
echo "========================================="
