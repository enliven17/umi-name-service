import type { Metadata } from 'next';
import StyledComponentsRegistry from '@/styles/registry';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Umi Name Service',
  description: 'Register .umi names on Umi Devnet with ETH',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
