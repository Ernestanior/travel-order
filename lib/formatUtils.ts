/**
 * 格式化金额为带千位分隔符的字符串
 * 例如: 1000 -> 1,000 | 1000000 -> 1,000,000
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(num)) {
    return '0.00'
  }
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * 格式化金额为带$符号和千位分隔符的字符串
 * 例如: 1000 -> $1,000.00 | 1000000 -> $1,000,000.00
 */
export function formatPrice(amount: number | string): string {
  return `$${formatCurrency(amount)}`
}
