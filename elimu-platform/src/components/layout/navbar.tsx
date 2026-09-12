'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  LogOut,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import Image from 'next/image';

const navLinks = [
  { label: 'Courses', href: '/courses' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg shrink-0">
          <Image src="/logo-icon.svg" alt="" aria-hidden width={32} height={32} className="h-8 w-8" />
          <span className="text-stone-900 hidden sm:inline">Elimu <span className="text-[#1a6b3c]">Africa</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <>
              <Button variant="ghost" size="sm" asChild className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              {(session.user as any)?.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                  <Link href="/admin">
                    <Shield className="mr-1.5 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f7f3] text-[#1a6b3c] text-sm font-semibold">
                  {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="bg-[#1a6b3c] text-white hover:bg-[#0d3d22] font-semibold rounded-full">
                <Link href="/register">Sign up free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-700 transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Dashboard
                </Link>
                {(session.user as any)?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 text-sm font-medium text-stone-500 rounded-lg hover:bg-stone-100 hover:text-stone-700 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium bg-[#1a6b3c] text-white rounded-full text-center font-semibold"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
