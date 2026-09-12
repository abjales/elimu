import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Sparkles, Users, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Elimu Africa — our mission to make world-class, AI-powered education accessible to every African learner.',
};

const values = [
  {
    icon: BookOpen,
    title: 'Accessible to everyone',
    body: 'Built mobile-first so anyone with a phone can learn, regardless of device, bandwidth, or budget.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered, human-centred',
    body: 'Multi-agent AI teachers and classmates make every lesson interactive — not just another video to watch.',
  },
  {
    icon: Users,
    title: 'Made for Africa',
    body: 'Priced in Kenyan Shillings and paid via M-Pesa, because learning should fit the way you already live and pay.',
  },
  {
    icon: GraduationCap,
    title: 'Real skills, real outcomes',
    body: 'Courses in tech, business and the sciences that move you from curious to competent, at your own pace.',
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1a6b3c] mb-3">ABOUT US</p>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-[#111310] font-[family-name:var(--font-playfair)]">
          Education for everyone, powered by AI
        </h1>
        <p className="text-base md:text-lg text-[#7a7468] leading-relaxed">
          Elimu Africa is an AI-powered learning platform on a simple mission: to bring
          world-class, interactive education to every learner across Africa — using only a phone
          or a laptop and a connection.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {values.map((v) => (
          <div key={v.title} className="rounded-2xl border border-[rgba(17,19,16,0.10)] p-6 flex flex-col gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0f7f3] text-[#1a6b3c]">
              <v.icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111310]">{v.title}</h2>
            <p className="text-sm text-[#7a7468] leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 md:mt-20 max-w-3xl mx-auto text-center bg-[#f7faf8] rounded-2xl p-8 md:p-12">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#111310] font-[family-name:var(--font-playfair)]">
          What we believe
        </h2>
        <p className="text-[#7a7468] text-base leading-relaxed mb-6">
          Traditional classrooms can&apos;t reach everyone, and pre-recorded courses go stale
          fast. We build tools where an AI tutor adapts to the way each learner thinks — turning
          any topic into a live, interactive lesson in seconds. The name &ldquo;Elimu&rdquo;
          means <em>education</em> in Swahili, and that&apos;s exactly what we&apos;re here to
          deliver to every corner of the continent.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center justify-center rounded-full bg-[#1a6b3c] hover:bg-[#0d3d22] text-white font-semibold px-8 py-3 text-sm transition-colors"
        >
          Explore courses
        </Link>
      </div>
    </div>
  );
}