
import { Resend } from 'resend';
import env from './env';

const resend = new Resend(env.RESEND_API_KEY);



export async function sendEmail(to: string, subject: string, html: string) {
    const result = await resend.emails.send({
        from: 'no-reply@pingponggame.dev',
        to: to,
        subject: subject,
        html: html,
    });
    return result;
}

