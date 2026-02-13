import { Resend } from 'resend';
import { env } from './env';

const resend = new Resend(env.resendApiKey);

export async function sendNotification(subject: string, body: string) {
  if (!env.resendApiKey) return;
  await resend.emails.send({
    from: 'HandyManJa <no-reply@handymanja.com>',
    to: [env.notificationEmail],
    subject,
    text: body
  });
}
