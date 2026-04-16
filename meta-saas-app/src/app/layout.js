import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'MetaSaaS — Your AI Co-Founder | Business-in-a-Box',
  description: 'Turn your idea into a market-ready SaaS in minutes. AI-powered niche discovery, blueprint generation, and sales automation. Your Business-in-a-Box robot.',
  keywords: 'SaaS, AI, business builder, no-code, startup, micro-SaaS, co-founder',
  openGraph: {
    title: 'MetaSaaS — Your AI Co-Founder',
    description: 'Turn your idea into a market-ready SaaS in minutes with AI-powered automation.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
