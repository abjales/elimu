'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, BookOpen, LayoutDashboard, User, LogIn } from 'lucide-react';

const guestLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Courses', href: '/courses', icon: BookOpen },
  { label: 'Log in', href: '/login', icon: LogIn },
];

const authLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Courses', href: '/courses', icon: BookOpen },
  { label: 'My Learning', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/dashboard', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const links = session ? authLinks : guestLinks;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full min-w-[3rem] transition-colors ${
                active ? 'text-[#1a6b3c]' : 'text-stone-400'
              }`}
            >
              <link.icon className={`h-5 w-5 ${active ? 'text-[#1a6b3c]' : ''}`} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${active ? 'text-[#1a6b3c]' : ''}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
