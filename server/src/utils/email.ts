import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (to: string, subject: string, body: string) => {
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject,
        html: body
    });
}

