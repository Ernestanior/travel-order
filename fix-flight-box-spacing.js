/**
 * 修复 Booking Invoice PDF 中 Flight Information Box 的间距问题
 */

const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'lib', 'pdfGenerator.ts')

// 读取文件
let content = fs.readFileSync(filePath, 'utf8')

console.log('🚀 开始修复 Flight Box 间距...\n')

// 替换所有相关的 X 坐标
const replacements = [
  // Date 值：52 -> 50
  { from: /text\(formatDate\(data\.departure(Date\d?)\), 52, y\)/g, to: 'text(formatDate(data.departure$1), 50, y)' },
  { from: /text\(formatDate\(data\.arrival(Date\d?)\), 52, y\)/g, to: 'text(formatDate(data.arrival$1), 50, y)' },
  
  // Time 标签：78 -> 75
  { from: /text\('Time :', 78, y\)/g, to: "text('Time :', 75, y)" },
  
  // Time 值：90 -> 88
  { from: /text\(data\.departureTime(\d?) \|\| '-', 90, y\)/g, to: 'text(data.departureTime$1 || \'-\', 88, y)' },
  { from: /text\(data\.arrivalTime(\d?) \|\| '-', 90, y\)/g, to: 'text(data.arrivalTime$1 || \'-\', 88, y)' },
  
  // Flight 标签：110 -> 115
  { from: /text\('Flight :', 110, y\)/g, to: "text('Flight :', 115, y)" },
  
  // Flight 值：125 -> 128
  { from: /text\(data\.departureFlight(\d?) \|\| '-', 125, y\)/g, to: 'text(data.departureFlight$1 || \'-\', 128, y)' },
  { from: /text\(data\.arrivalFlight(\d?) \|\| '-', 125, y\)/g, to: 'text(data.arrivalFlight$1 || \'-\', 128, y)' },
]

let changeCount = 0

replacements.forEach(({ from, to }, index) => {
  const matches = content.match(from)
  if (matches) {
    console.log(`✅ 替换 ${matches.length} 处: ${from}`)
    content = content.replace(from, to)
    changeCount += matches.length
  }
})

// 写回文件
fs.writeFileSync(filePath, content, 'utf8')

console.log(`\n✨ 完成! 共修改了 ${changeCount} 处\n`)
console.log('📊 调整后的布局：')
console.log('   Date 值: 52 -> 50 (缩小)')
console.log('   Time 标签: 78 -> 75')
console.log('   Time 值: 90 -> 88 (扩大空间)')
console.log('   Flight 标签: 110 -> 115')
console.log('   Flight 值: 125 -> 128')
console.log('   Destination: 保持不变 (148, 170)')
