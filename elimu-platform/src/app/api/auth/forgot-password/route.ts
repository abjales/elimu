import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const RESET_IDENTIFIER_PREFIX = 'password-reset:';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  try {
    const { email } = forgotSchema.parse(await request.json());
    const normalizedEmail = email.toLowerCase();

    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    // Always return the same success response to avoid revealing which
    // emails have accounts.
    if (user) {
      const token = nanoid(32);
      const identifier = `${RESET_IDENTIFIER_PREFIX}${normalizedEmail}`;
      const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      // Invalidate any previous reset tokens for this address.
      await db.delete(verificationTokens).where(
        eq(verificationTokens.identifier, identifier)
      );

      await db.insert(verificationTokens).values({
        identifier,
        token,
        expires,
      });

      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      await sendEmail({
        to: normalizedEmail,
        subject: 'Reset your Elimu Africa password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f2937;">
            <h2 style="color: #1a6b3c; margin-bottom: 16px;">Reset your password</h2>
            <p style="line-height: 1.6;">We received a request to reset your Elimu Africa account password. Click the button below to set a new one. This link expires in 1 hour.</p>
            <p style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" style="background: #1a6b3c; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: 600;">Reset password</a>
            </p>
            <p style="line-height: 1.6; color: #6b7280; font-size: 13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
            <p style="line-height: 1.6; color: #6b7280; font-size: 13px; word-break: break-all;">Button not working? Copy this link: ${resetUrl}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}