import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (to: string, subject: string, body: string) => {

    const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to,
        subject,
        html: body,
    });

    if (error) {
        return console.log("ERRROR FROM RESEND : ", { error });
    }

    console.log({ data });
    return data;
}

