import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: 'Hadi Vahidi | Web Developer',
    template: '%s | Hadi Vahidi'
  },
  description: 'Personal website of Hadi Vahidi, web developer with over 10 years of experience',
  keywords: ['web development', 'frontend', 'React', 'Next.js', 'developer', 'portfolio'],
  authors: [{ name: 'Hadi Vahidi' }],
  creator: 'Hadi Vahidi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hadivahidi.com',
    title: 'Hadi Vahidi | Web Developer',
    description: 'Personal website of Hadi Vahidi, web developer with over 10 years of experience',
    siteName: 'Hadi Vahidi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hadi Vahidi | Web Developer',
    description: 'Personal website of Hadi Vahidi, web developer with over 10 years of experience',
    creator: '@hadivahidi',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-grow pt-20">{children}</main>
          <Footer />
        </ThemeProvider>
        
        {/* Initialize EmailJS (client-side only) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  if (window.emailjs) {
                    window.emailjs.init('${process.env.NEXT_PUBLIC_EMAILJS_USER_ID || ''}');
                  }
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
