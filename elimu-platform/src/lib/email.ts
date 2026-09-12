import nodemailer from 'nodemailer';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: { user: string; pass: string };
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' && port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return {
    host,
    port,
    secure,
    auth: user ? { user, pass: pass || '' } : undefined,
  };
}

const smtp = getSmtpConfig();
const transporter = smtp ? nodemailer.createTransport(smtp) : null;

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email via whatever SMTP server is configured (self-hosted Postfix,
 * SES, Postmark, SendGrid, Mailgun — anything that speaks SMTP).
 * When SMTP_HOST is unset, the message is logged to the server console instead
 * of throwing, so the flow stays testable end-to-end in development.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const from = process.env.SMTP_FROM || 'Elimu Africa <no-reply@localhost>';

  if (!transporter) {
    console.log('\n[email] SMTP_HOST not set — skipping send. Preview below:\n');
    console.log(`  From:    ${from}`);
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}\n`);
    console.log(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    console.log('\n');
    return;
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}