export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  body: string[];
};

export const posts: BlogPost[] = [
  {
    slug: 'how-ai-classrooms-work',
    title: 'How AI Classrooms actually work',
    excerpt:
      'A behind-the-scenes look at our multi-agent system — how AI teachers, classmates and a whiteboard come together to teach you interactively.',
    date: '2026-09-01',
    tag: 'Product',
    body: [
      'Most online courses are pre-recorded: you watch a video, take a quiz, move on. AI Classrooms are different. When you open one, every part of the lesson is generated in real time around your topic.',
      'Under the hood is a multi-agent system. A lead teacher agent structures the lesson — an outline, slides and a quiz. Specialist agents then play supporting roles: classmates who ask the questions a real student would ask, a tutor who answers your follow-ups, and a note-taker that turns everything into materials you can export.',
      'Because the lesson is generated on demand, it is never outdated. Describe a topic, or upload a PDF or textbook chapter, and the classroom is built around your exact source material. You can raise your hand, answer quizzes and debate with the AI peers in the room.',
      'The result is a lesson that adapts to your pace and your questions — closer to a study group than a video library. That is the core idea behind Elimu Africa.',
    ],
  },
  {
    slug: 'why-mpesa-first',
    title: 'Why we chose M-Pesa as our first payment method',
    excerpt:
      'For most Kenyan learners, M-Pesa isn&apos;t a novelty — it&apos;s how money moves. Here&apos;s why we built lipa na M-Pesa directly into checkout.',
    date: '2026-08-22',
    tag: 'Company',
    body: [
      'When we built Elimu Africa, we had a choice about how learners would pay for Pro. We could have started with cards. Instead, we started with M-Pesa.',
      'The reason is simple: most people we want to serve do not have or prefer to use a credit card, but nearly everyone has M-Pesa on their phone. If we wanted education to be truly accessible, payments had to fit the way people already live.',
      'We integrated Safaricom&apos;s Daraja API so that checking out is literally entering your phone number and approving a prompt on your handset. No card number, no billing address — just the familiar lipa na M-Pesa flow.',
      'We price in Kenyan Shillings, not dollars, and we keep a simple monthly, annual and lifetime model so there are no surprises. Payment is the last mile of accessibility, and we wanted to get it right from day one.',
    ],
  },
  {
    slug: 'study-tips-2026',
    title: 'Five study habits that stick in 2026',
    excerpt:
      'Spaced repetition, active recall and learning alongside an AI tutor — practical strategies to retain more of what you study.',
    date: '2026-08-10',
    tag: 'Learning',
    body: [
      'Learning a lot feels good. Retaining it is the hard part. These five habits reliably help you keep more of what you study.',
      '1. Use active recall. Instead of re-reading notes, close them and ask yourself what the material says. Self-testing beats passive review by a wide margin.',
      '2. Space it out. Return to a topic after a day, then a week, then a month. Spacing fights the forgetting curve better than cramming.',
      '3. Learn with others. Explaining a concept to someone else — or debating it with classmates — exposes gaps in your own understanding.',
      '4. Teach what you learn. If you can teach it clearly, you actually know it. Try summarising each lesson in your own words.',
      '5. Practise with an interactive tutor. An AI classroom lets you ask questions the moment they arise, turning reading into a conversation.',
      'None of this is new — but doing it consistently is what separates learners who retain from those who forget.',
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}