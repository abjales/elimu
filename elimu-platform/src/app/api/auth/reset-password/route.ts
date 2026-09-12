import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const RESET_IDENTIFIER_PREFIX = 'password-reset:';

export async function POST(request: Request) {
  try {
    const { token, password } = resetSchema.parse(await request.json());

    // Find a valid, unexpired reset token.
    const [record] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, token),
          gt(verificationTokens.expires, new Date())
        )
      )
      .limit(1);

    if (!record || !record.identifier.startsWith(RESET_IDENTIFIER_PREFIX)) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const email = record.identifier.slice(RESET_IDENTIFIER_PREFIX.length);
    const passwordHash = await bcrypt.hash(password, 12);

    const [updated] = await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.email, email))
      .returning({ id: users.id });

    if (!updated) {
      return NextResponse.json({ error: 'Account not found' }, { status: 400 });
    }

    // Consume the token so it can't be reused.
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}