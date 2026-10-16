import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'PixelLift - AI Image Super-Resolution & 4K Upscaler',
  description:
    'Turn blurry, low-resolution images into razor-sharp 4K masterpieces with Real-ESRGAN deep learning AI. 50 Credits for $5 with zero monthly commitments.',
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
    <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-zinc-100 antialiased selection:bg-brand-500/30 selection:text-brand-200">
        <ClerkProvider>
          <ToastProvider>{children}</ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
