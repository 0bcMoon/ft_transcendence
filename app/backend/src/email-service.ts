
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import env from './env';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    }
});


export async function sendEmail(to: string, subject: string, content: string) {
    try {
        let info = await transporter.sendMail({
            from: env.SMTP_FROM,
            to: to,
            subject: subject,
            html: content
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        return { success: false, error: error };
    }
}
// export async function sendEmail(to: string, subject: string, html: string) {
//     const result = await resend.emails.send({
//         from: 'no-reply@pingponggame.dev',
//         to: to,
//         subject: subject,
//         html: html,
//     });
//     return result;
// }

