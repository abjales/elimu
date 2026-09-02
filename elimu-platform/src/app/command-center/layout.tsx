import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'J.A.R.V.I.S. Command Center | ELIMU',
  description: 'AI-powered command center for the Elimu Africa platform',
};

export default function CommandCenterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a] overflow-hidden">
      {children}
    </div>
  );
}