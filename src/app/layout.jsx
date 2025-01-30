/* eslint-disable @next/next/no-page-custom-font */
import { NotificationProvider } from '@/frontend/context/NotificationContext';

import { NotificationList } from '@/frontend/components/Notification/NotificationList'
import { TopBar } from '@/frontend/components/TopBar/TopBar';

import './globals.css'

export const metadata = {
  title: 'Flashback Hub',
  description: 'Ferramenta administrativa',
  icons: {
    icon: '/main/Flashback.png',
    shortcut: '/main/Flashback.png',
    apple: '/main/Flashback.png',
  },
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
        <body>
          <NotificationProvider>
            <TopBar title="Hub Administrativo" logo="/main/Flashback.png"></TopBar>
            <NotificationList/>
            {children}
          </NotificationProvider>
        </body>
    </html>
  )
}
