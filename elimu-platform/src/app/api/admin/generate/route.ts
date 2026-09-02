import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const generateSchema = z.object({
  prompt: z.string().min(10, 'Please provide a more detailed description'),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt } = generateSchema.parse(body);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI generation not configured. Add OPENROUTER_API_KEY to .env.local.' },
        { status: 503 },
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'tencent/hy3:free',
        messages: [
          {
            role: 'system',
            content: `You are a course content generator for an online learning platform called ELIMU.
Given a topic prompt, generate a JSON object with this exact structure:
{
  "title": "Course title (max 200 chars)",
  "description": "Full course description (2-4 paragraphs)",
  "shortDescription": "One-line summary for course cards (max 200 chars)",
  "sections": [
    {
      "title": "Section title",
      "lessons": [
        {
          "title": "Lesson title",
          "type": "ai-classroom",
          "duration": 15
        }
      ]
    }
  ]
}

IMPORTANT REALISM RULES:
- ALL lessons must have type "ai-classroom". No other types are allowed.
- The course must represent about 10 days of learning (approximately 10-15 hours of content).
- Generate 6-10 sections. Each section should represent roughly 1-2 days of study.
- Each section must have 3-5 lessons. Each lesson should be 15 minutes long.
- Section titles should progress logically from foundational concepts to advanced topics.
- Lesson titles must be specific and descriptive (e.g., "Building REST APIs with Express.js" not "APIs Part 1").
- Duration is in minutes per lesson (always 15).
- Aim for a total of 20-50 lessons and 300-750 total minutes across all lessons.
Return ONLY valid JSON, no markdown or explanation.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', errText);
      return NextResponse.json(
        { error: 'AI generation failed. Please try again.' },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'AI returned an empty response' },
        { status: 502 },
      );
    }

    // Strip markdown code fences if present
    const cleaned = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    let generated;
    try {
      generated = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', cleaned);
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      title: generated.title || '',
      description: generated.description || '',
      shortDescription: generated.shortDescription || '',
      sections: generated.sections || [],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }
    console.error('Generate course error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
