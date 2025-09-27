
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);



export async function sendEmail(to: string, subject: string, html: string) {
    const result = await resend.emails.send({
        from: 'no-reply@pingponggame.dev',
        to: to,
        subject: subject,
        html: html,
    });
    console.log('Email sent:', result);
    return result;
}

