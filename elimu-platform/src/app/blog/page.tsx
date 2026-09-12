import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { posts, formatDate } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'News, guides and learning tips from the Elimu Africa team — AI in education, course updates and study strategies.',
};

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1a6b3c] mb-3">BLOG</p>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-[#111310] font-[family-name:var(--font-playfair)]">
          News &amp; insights from the team
        </h1>
        <p className="text-base md:text-lg text-[#7a7468]">
          Product updates, learning strategies and thoughts on AI in education.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-[rgba(17,19,16,0.10)] p-6 transition-colors hover:border-[#1a6b3c]/40"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1a6b3c] bg-[#f0f7f3] rounded-full px-3 py-1">
                {post.tag}
              </span>
              <span className="text-xs text-[#7a7468]">{formatDate(post.date)}</span>
            </div>
            <h2 className="text-lg font-bold mb-2 text-[#111310] group-hover:text-[#1a6b3c] transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-[#7a7468] leading-relaxed mb-4 flex-1">{post.excerpt}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6b3c]">
              Read more
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}