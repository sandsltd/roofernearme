import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roofing Tips & Advice | Expert Guides from Roofer Near Me',
  description: 'Expert roofing advice, maintenance tips, and guides to help you make informed decisions about your roof. Learn from trusted roofing professionals.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 