import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from '@/components/layout/Header'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DoMyHomework - Order Academic Writing & Homework Help Online",
  description: "Order professional academic writing, editing, and presentation services online. Get expert homework help with essays, research papers, and more. Fast, reliable, and affordable.",
  keywords: "homework help, academic writing service, essay writing, research papers, order online, domyhomework, assignment help, professional writers",
  authors: [{ name: "DoMyHomework" }],
  robots: "index, follow",
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/icons/Favicon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16', 
      url: '/icons/Favicon.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/icons/Favicon.png',
    }
  ],
  openGraph: {
    title: "DoMyHomework - Order Academic Writing & Homework Help Online",
    description: "Order professional academic writing, editing, and presentation services online. Get expert homework help with essays, research papers, and more.",
    type: "website",
    locale: "en_US",
    url: "https://domyhomework.co",
  },
  twitter: {
    card: "summary_large_image",
    title: "DoMyHomework - Order Academic Writing & Homework Help Online", 
    description: "Order professional academic writing, editing, and presentation services online. Get expert homework help with essays, research papers, and more.",
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8800e9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-purple-50 via-white to-teal-50`}>
  <Header />
  {children}
</body>
    </html>
  );
}