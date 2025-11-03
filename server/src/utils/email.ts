import { Resend } from 'resend';

const resend = new Resend('re_d1esXcou_DgCnxWtXdwHTLMUa9AsNKpnd');

export const sendMail = async (to: string, subject: string, body: string) => {
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject,
        html: body
    });
}

