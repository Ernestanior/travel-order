import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '机票订单管理系统',
  description: '简单的机票订单和发票管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
