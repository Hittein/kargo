import './globals.css';
import { Shell } from '@/components/Shell';

export const metadata = {
  title: 'Kargo Admin',
  description: 'Console d\'administration Kargo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
