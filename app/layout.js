export const metadata = {
  title: '語音輸入工具',
  description: '語音轉文字，支援 AI 自動潤稿',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
