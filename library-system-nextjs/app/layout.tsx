import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '図書館予約管理システム',
  description: 'Next.js + TypeScript版の図書館予約管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="container">{children}</main>
          <footer className="footer">
            <div className="container">
              <p>&copy; 2024 図書館予約管理システム</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
