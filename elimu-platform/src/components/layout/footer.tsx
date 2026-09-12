import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Courses', href: '/courses' },
  ],
  Support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Email', href: 'mailto:elimuafrica9@gmail.com' },
    { label: 'Call', href: 'tel:+254799867572' },
  ],
  'Legal': [
    { label: 'Terms', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Cookie Settings', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0d3d22] border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <Image src="/logo-icon.svg" alt="Elimu Africa" width={32} height={32} className="h-8 w-8" />
              <span className="text-white">Elimu <span className="text-[#e8b84b]">Africa</span></span>
            </Link>
            <p className="text-sm text-white/50">
              AI-powered interactive learning platform for everyone.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-bold text-white text-sm mb-4">{heading}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} Elimu Africa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
