import type { Metadata } from 'next';
import { Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Elimu Africa team — questions, feedback and support. Email elimuafrica9@gmail.com or call +254 799 867 572.',
};

const EMAIL = 'elimuafrica9@gmail.com';
const PHONE_DISPLAY = '+254 799 867 572';
const PHONE_TEL = '+254799867572';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1a6b3c] mb-3">CONTACT US</p>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-[#111310] font-[family-name:var(--font-playfair)]">
          We&apos;d love to hear from you
        </h1>
        <p className="text-base md:text-lg text-[#7a7468]">
          Questions about courses, your account, or how AI classrooms work? Reach out and
          we&apos;ll get back to you as soon as we can.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <a
          href={`mailto:${EMAIL}`}
          className="rounded-2xl border border-[rgba(17,19,16,0.10)] p-8 flex flex-col items-center text-center gap-3 transition-colors hover:border-[#1a6b3c]/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f7f3] text-[#1a6b3c]">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="font-bold text-[#111310]">Email us</h2>
          <p className="text-[#7a7468] text-sm break-all">{EMAIL}</p>
        </a>

        <a
          href={`tel:${PHONE_TEL}`}
          className="rounded-2xl border border-[rgba(17,19,16,0.10)] p-8 flex flex-col items-center text-center gap-3 transition-colors hover:border-[#1a6b3c]/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f7f3] text-[#1a6b3c]">
            <Phone className="h-6 w-6" />
          </div>
          <h2 className="font-bold text-[#111310]">Call or text us</h2>
          <p className="text-[#7a7468] text-sm">{PHONE_DISPLAY}</p>
        </a>
      </div>

      <div className="mt-12 max-w-3xl mx-auto text-center">
        <p className="text-sm text-[#7a7468]">
          Prefer to learn hands-on first?{' '}
          <a href="/courses" className="text-[#1a6b3c] font-semibold hover:underline">
            Browse the course catalog
          </a>
          .
        </p>
      </div>
    </div>
  );
}