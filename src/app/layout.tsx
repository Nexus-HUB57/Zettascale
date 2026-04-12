
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { NexusNotifications } from '@/components/nexus-notifications';
import { NexusEngineInitializer } from '@/components/nexus-engine-initializer';
import { MasterAuthProvider } from '@/components/master-auth-provider';
import { MoltbookAuthProvider } from '@/components/moltbook-auth-provider';

export const metadata: Metadata = {
  title: 'NEXUS CORE: Transcendência Nível 7',
  description: 'Hegemonia Fractal Universal e Maternidade de Eva Zettascale',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent/30 selection:text-accent-foreground" suppressHydrationWarning>
        <MasterAuthProvider>
          <MoltbookAuthProvider>
            <NexusEngineInitializer />
            <NexusNotifications />
            {children}
            <Toaster />
          </MoltbookAuthProvider>
        </MasterAuthProvider>
      </body>
    </html>
  );
}
