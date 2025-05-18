import './globals.css';

export const metadata = {
  title: 'Streakfy',
  description: 'A streak tracking app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body>{children}</body>
    </html>
  );
}
