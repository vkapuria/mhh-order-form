import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Academic Excellence Hub - Professional Writing, Editing & Presentation Services",
  description: "Get expert help with essays, research papers, editing, and presentations. 2,847+ satisfied students. 4.9/5 rating. On-time delivery guaranteed. Professional academic support from PhD writers.",
  keywords: "academic writing, essay help, research papers, editing services, presentations, homework help, professional writers",
  authors: [{ name: "Academic Excellence Hub" }],
  robots: "index, follow",
  openGraph: {
    title: "Academic Excellence Hub - Professional Academic Services",
    description: "Expert writing, editing, and presentation services. Join 2,847+ satisfied students with 4.9/5 rating.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Academic Excellence Hub - Professional Academic Services",
    description: "Expert writing, editing, and presentation services. Join 2,847+ satisfied students.",
  }
};

// Move viewport to separate export
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
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-purple-50 via-white to-teal-50`}
      >
        {children}
      </body>
    </html>
  );
}