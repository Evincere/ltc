import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LTC Price Prophet',
  description: 'Predicciones de precio y análisis técnico para Litecoin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
