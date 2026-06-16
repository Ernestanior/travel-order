# Invoice Flight Information 已修复 ✅

## 问题
Booking Order 详情页显示多个航班信息（Departure 1, Departure 2, Arrival），但生成的 Invoice PDF 只显示 2 个（Departure 1 和 Arrival 1）。

## 解决方案
修改了 Booking Invoice 的 Flight Information Box，现在支持**动态显示所有航班信息**。

## 更新内容

### 原来的逻辑
- ❌ 固定显示 Departure Date 1 + Arrival Date 1
- ❌ 忽略 Departure 2 和 Arrival 2

### 新的逻辑
- ✅ 动态检测有多少个航班
- ✅ 自动调整 Box 高度
- ✅ 按顺序显示所有航班：
  - Departure Date 1 + Details
  - Departure Date 2 + Details（如果有）
  - Arrival Date 1 + Details
  - Arrival Date 2 + Details（如果有）

## 显示格式

```
┌─────────────────────────────────────────────────────────────┐
│ Departure Date 1:  2026-07-01                               │
│ Time 1: 17:55    Flight 1: HK233    Destination 1: BY747    │
│                                                              │
│ Departure Date 2:  2026-07-06                               │
│ Time 2: 04:55    Flight 2: UY333    Destination 2: IU999    │
│                                                              │
│ Arrival Date 1:    2027-01-08                               │
│ Time 1: 09:34    Flight 1: YY312    Destination 1: UU321    │
│                                                              │
│ Arrival Date 2:    2027-01-10  (如果有)                     │
│ Time 2: 15:20    Flight 2: XX111    Destination 2: ZZ999    │
└─────────────────────────────────────────────────────────────┘
```

## 动态高度计算

代码会自动计算需要多少行：
- 每个航班 = 2 行（日期行 + 详情行）
- Box 高度 = 行数 × 5mm + 5mm（padding）
- 最小高度 = 25mm

```typescript
let flightLines = 0
if (data.departureDate) flightLines += 2
if (data.departureDate2) flightLines += 2
if (data.arrivalDate) flightLines += 2
if (data.arrivalDate2) flightLines += 2

const boxHeight = Math.max(25, flightLines * 5 + 5)
```

## 字段映射

### Departure 1
- Date: `departureDate`
- Time: `departureTime`
- Flight: `departureFlight`
- Destination: `departureDest`

### Departure 2
- Date: `departureDate2`
- Time: `departureTime2`
- Flight: `departureFlight2`
- Destination: `departureDest2`

### Arrival 1
- Date: `arrivalDate`
- Time: `arrivalTime`
- Flight: `arrivalFlight`
- Destination: `arrivalDest`

### Arrival 2
- Date: `arrivalDate2`
- Time: `arrivalTime2`
- Flight: `arrivalFlight2`
- Destination: `arrivalDest2`

## 测试案例

### 案例 1: 只有 Departure 1 和 Arrival 1
- Box 显示 2 个航班
- 高度: 25mm（最小高度）

### 案例 2: 有 Departure 1, Departure 2, Arrival 1
- Box 显示 3 个航班
- 高度: 35mm (3 × 5 + 5 + 其他)

### 案例 3: 全部 4 个航班
- Box 显示 4 个航班
- 高度: 45mm

## 兼容性

✅ 向后兼容 - 如果没有 Departure 2 或 Arrival 2，不会显示空行
✅ 自动适应 - Box 高度根据实际航班数量调整
✅ 数据库字段 - 使用现有的数据库字段，无需修改数据结构

## 文件修改

- ✅ `lib/pdfGenerator.ts` - `generateBookingInvoicePDF()` 函数
- ✅ Flight Information Box 部分
- ✅ 动态高度计算逻辑

## 现在可以做什么

1. ✅ 创建有多个航班的订单
2. ✅ 导出 PDF Invoice
3. ✅ 所有航班信息都会显示在 Flight Information Box 中

完美解决！
