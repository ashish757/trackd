import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER, // your email
            pass: process.env.EMAIL_PASSWORD, // app password or generated key
        },
    });

    await transporter.sendMail({
        from: `Trackd`,
        to,
        subject,
        text,
    });
};
