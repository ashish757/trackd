// import nodemailer from 'nodemailer';
//
// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });
//
// export const sendEmail = async (to: string, subject: string, text: string) => {
//     const mailOptions = {
//         from: process.env.EMAIL_FROM,
//         to,
//         subject,
//         text,
//     };
//
//     transporter.sendMail(mailOptions);
// }
//


import nodemailer from "nodemailer";

const portsToTry = [587, 465, 2525]; // common SMTP ports

export async function sendEmail(to, subject, text) {
    const smtpHost = "smtp.gmail.com";
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    for (const port of portsToTry) {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port,
            secure: port === 465, // true only for port 465
            auth: { user, pass },
            tls: {
                rejectUnauthorized: false, // helps avoid SSL verification errors
            },
        });

        try {
            await transporter.verify(); // check if connection works
            console.log(`✅ SMTP connection successful on port ${port}`);

            await transporter.sendMail({
                from: user,
                to,
                subject,
                html: text,
            });

            console.log(`📨 Email sent successfully using port ${port}`);
            return { success: true, message: `Mail sent via port ${port}` };
        } catch (err) {
            console.error(`❌ Failed on port ${port}:`, err.message);
            // try next port
        }
    }

    // If all ports failed:
    return {
        success: false,
        message: "Not able to send email using any available port.",
    };
}
