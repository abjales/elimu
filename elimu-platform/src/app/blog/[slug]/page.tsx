import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getPost, formatDate } from '@/lib/blog';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Post not found' };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <article className="max-w-2xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6b3c] hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1a6b3c] bg-[#f0f7f3] rounded-full px-3 py-1">
            {post.tag}
          </span>
          <span className="text-xs text-[#7a7468]">{formatDate(post.date)}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-[#111310] font-[family-name:var(--font-playfair)]">
          {post.title}
        </h1>

        <div className="space-y-5">
          {post.body.map((paragraph, i) => (
            <p key={i} className="text-base md:text-lg text-[#37342e] leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}