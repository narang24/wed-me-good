import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Wedding Management System',
  description: 'Manage your perfect wedding',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}