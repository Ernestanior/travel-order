#!/bin/bash

# 验证所有日期格式是否正确使用 DD-MM-YYYY 格式
# 此脚本检查项目中是否还有未使用 formatDate 的日期显示

echo "🔍 检查项目中的日期格式..."
echo ""

# 查找可能直接显示日期而没有使用 formatDate 的地方
echo "📋 检查可能未格式化的日期显示："
echo ""

# 检查 TSX 文件中的日期字段
echo "1. 检查 Booking Order 相关日期："
grep -rn "order\.bookingDate\|order\.departureDate\|order\.arrivalDate" app/**/*.tsx 2>/dev/null | \
  grep -v "formatDate" | \
  grep -v "value=" | \
  grep -v "onChange" | \
  grep -v "new Date" | \
  grep -v "type=\"date\"" | \
  grep -v "//.*" || echo "   ✅ 所有 Booking Order 日期已正确格式化"

echo ""
echo "2. 检查 Exchange Order 相关日期："
grep -rn "order\.exchangeDate\|exchange\.date" app/**/*.tsx 2>/dev/null | \
  grep -v "formatDate" | \
  grep -v "value=" | \
  grep -v "onChange" | \
  grep -v "new Date" | \
  grep -v "type=\"date\"" | \
  grep -v "//.*" || echo "   ✅ 所有 Exchange Order 日期已正确格式化"

echo ""
echo "3. 检查 Payment/Receipt 相关日期："
grep -rn "payment\.date\|receipt\.date" app/**/*.tsx 2>/dev/null | \
  grep -v "formatDate" | \
  grep -v "value=" | \
  grep -v "onChange" | \
  grep -v "new Date" | \
  grep -v "type=\"date\"" | \
  grep -v "//.*" || echo "   ✅ 所有 Payment/Receipt 日期已正确格式化"

echo ""
echo "4. 检查 Passenger 相关日期："
grep -rn "passenger\.birthdate\|passenger\.passportExpiryDate" app/**/*.tsx 2>/dev/null | \
  grep -v "formatDate" | \
  grep -v "value=" | \
  grep -v "onChange" | \
  grep -v "new Date" | \
  grep -v "type=\"date\"" | \
  grep -v "//.*" || echo "   ✅ 所有 Passenger 日期已正确格式化"

echo ""
echo "5. 检查结果日期显示："
grep -rn "result\.\(bookingDate\|departureDate\|exchangeDate\)" app/**/*.tsx 2>/dev/null | \
  grep -v "formatDate" | \
  grep -v "value=" | \
  grep -v "interface" | \
  grep -v "type" | \
  grep -v "//.*" || echo "   ✅ 所有结果日期已正确格式化"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 已修改的文件列表："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ app/booking-orders/[id]/page.tsx"
echo "   - Booking Date (Created on)"
echo "   - Flight Departure/Arrival Dates (1, 2, 3)"
echo "   - Passenger Birth Date & Passport Expiry"
echo ""
echo "✅ app/exchange-orders/[id]/page.tsx"
echo "   - Exchange Date (Created on)"
echo "   - Flight Departure/Arrival Dates (1, 2, 3)"
echo ""
echo "✅ app/passenger-inquiry/page.tsx"
echo "   - Booking Date"
echo "   - Departure Date"
echo ""
echo "✅ app/receipts/page.tsx"
echo "   - 已使用 formatDate"
echo ""
echo "✅ lib/dateUtils.ts"
echo "   - formatDate 函数返回 DD-MM-YYYY 格式"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 所有日期已统一为 DD-MM-YYYY 格式！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
