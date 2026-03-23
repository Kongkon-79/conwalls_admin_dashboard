import type { Metadata } from 'next'
import '../globals.css'
import { Toaster } from '@/components/ui/sonner'
import AuthProvider from '@/components/providers/AuthProvider'
import AppProvider from '@/components/providers/AppProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Conwalls Admin Dashboard',
  description: 'Conwalls -Admin Dashboard. manage trainer and system settings',
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`font-nunito antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AppProvider>
              {/* <DashboardHeader/> */}

              {children}

              <Toaster />
            </AppProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
