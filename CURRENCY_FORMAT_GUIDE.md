# 货币格式化使用指南

## 📦 工具函数位置
`lib/formatUtils.ts`

## 🎯 可用函数

### 1. formatCurrency(amount)
格式化数字为带千位分隔符的货币格式（不含$符号）

```typescript
formatCurrency(1000)      // → "1,000.00"
formatCurrency(1000000)   // → "1,000,000.00"
formatCurrency("1234.56") // → "1,234.56"
```

**使用场景**：
- PDF文档中（配合模板字符串使用 `` `$${formatCurrency(amount)}` ``）
- 需要自定义货币符号时

### 2. formatPrice(amount)
格式化数字为带$符号和千位分隔符的价格格式

```typescript
formatPrice(1000)      // → "$1,000.00"
formatPrice(1000000)   // → "$1,000,000.00"
formatPrice("1234.56") // → "$1,234.56"
```

**使用场景**：
- UI页面中显示价格（最常用）
- 订单金额、支付金额等

## 💡 使用示例

### React组件中使用

```tsx
import { formatPrice } from '@/lib/formatUtils'

// 1. 简单显示
<span>{formatPrice(order.totalCost)}</span>

// 2. 在表格中
<td className="text-right">
  {formatPrice(item.price)}
</td>

// 3. 在条件渲染中
<span className={order.outstanding > 0 ? 'text-red-600' : 'text-green-600'}>
  {formatPrice(order.outstanding)}
</span>

// 4. 在计算中使用
<div>
  {formatPrice(items.reduce((sum, item) => sum + item.price, 0))}
</div>

// 5. 在input中（只读）
<input 
  type="text" 
  value={formatPrice(amount)} 
  readOnly 
/>

// 6. 带前缀文本
<p>Total: {formatPrice(totalAmount)}</p>

// 7. 在内联文本中
<p>{item.quantity} × {formatPrice(item.unitPrice)}</p>
```

### PDF生成器中使用

```typescript
import { formatCurrency } from './formatUtils'

// 在模板字符串中使用
doc.text(`$${formatCurrency(data.totalPrice)}`, x, y, { align: 'right' })

// 在表格数据中使用
[
  item.name,
  item.quantity.toString(),
  `$${formatCurrency(item.unitPrice)}`,
  `$${formatCurrency(item.price)}`
]
```

## ⚠️ 常见错误

### ❌ 错误示例

```tsx
// 1. 缺少花括号
<span>formatPrice(amount)</span>

// 2. 错误的模板字符串
<input value={`$formatPrice(amount)`} />

// 3. 混用$符号
<span>${formatPrice(amount)}</span>  // 会显示 $$1,000.00

// 4. 在字符串中使用
const text = "Total: formatPrice(amount)"  // 不会执行函数
```

### ✅ 正确示例

```tsx
// 1. 用花括号包裹
<span>{formatPrice(amount)}</span>

// 2. 直接使用函数
<input value={formatPrice(amount)} />

// 3. formatPrice已包含$符号
<span>{formatPrice(amount)}</span>  // 显示 $1,000.00

// 4. 在模板字符串中执行
const text = `Total: ${formatPrice(amount)}`  // 正确
```

## 📋 检查清单

在添加新的金额显示时，请检查：

- [ ] 已导入 `formatPrice` 或 `formatCurrency`
- [ ] 在 JSX 中使用了花括号 `{}`
- [ ] 没有重复添加 `$` 符号
- [ ] 金额值正确传入（number 或 string 类型）
- [ ] 编译无错误
- [ ] 页面显示正确（数字，不是函数名）

## 🔍 快速测试

运行以下命令检查是否有遗漏的地方：

```bash
# 检查是否还在使用旧的 toFixed 方法
grep -r "toFixed(2)" app --include="*.tsx"

# 检查是否有缺少花括号的 formatPrice
grep -r ">formatPrice\|>formatCurrency" app --include="*.tsx"
```

## 📊 支持的数据类型

```typescript
formatPrice(1000)        // ✅ number
formatPrice("1000")      // ✅ string
formatPrice(1000.5)      // ✅ decimal
formatPrice("1000.50")   // ✅ string decimal
formatPrice(0)           // ✅ zero → "$0.00"
formatPrice(null)        // ⚠️ → "$0.00"
formatPrice(undefined)   // ⚠️ → "$0.00"
```

## 🎨 显示效果

| 输入值 | 输出结果 |
|--------|----------|
| 100 | $100.00 |
| 1000 | $1,000.00 |
| 10000 | $10,000.00 |
| 100000 | $100,000.00 |
| 1000000 | $1,000,000.00 |
| 1234.56 | $1,234.56 |

## 🚀 性能提示

- `toLocaleString` 是原生 JavaScript 方法，性能良好
- 适合用于所有金额显示场景
- 无需担心大数字处理

---

**记住**：在项目中显示任何金额时，都使用 `formatPrice()` 函数！ 💰
