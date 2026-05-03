import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'MetaBox — Your AI Co-Founder | Business-in-a-Box',
  description: 'Turn your idea into a market-ready SaaS in minutes. AI-powered niche discovery, blueprint generation, and sales automation with MetaBox.',
  keywords: 'MetaBox, SaaS, AI, business builder, no-code, startup, micro-SaaS, co-founder',
  openGraph: {
    title: 'MetaBox — Your AI Co-Founder',
    description: 'Turn your idea into a market-ready SaaS in minutes with AI-powered automation.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
