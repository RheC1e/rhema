import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MSALProvider } from '@/components/MSALProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RHEMA - Microsoft 365 登入',
  description: '航冠國際聯運有限公司員工登入系統',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <MSALProvider>
          {children}
        </MSALProvider>
      </body>
    </html>
  )
}

