// import nodemailer from "nodemailer";
//
// export async function sendEmail(to, subject, text) {
//     const smtpHost = process.env.EMAIL_SMTP_HOST || "smtp.gmail.com";
//     const user = process.env.EMAIL_USER;
//     const pass = process.env.EMAIL_PASSWORD;
//
//     // Common SMTP ports to try
//     const portsToTry = [587, 465, 2525];
//
//     for (const port of portsToTry) {
//         const transporter = nodemailer.createTransport({
//             host: smtpHost,
//             port,
//             secure: port === 465, // only true for SSL port 465
//             auth: { user, pass },
//             tls: { rejectUnauthorized: false },
//         });
//
//         console.log("host: ", smtpHost, "port: ", port);
//         console.log("user: ", user, "pass: ", pass);
//
//         try {
//             // Verify connection first
//             await transporter.verify();
//             console.log(`SMTP connected successfully on port ${port}`);
//
//             // Send the actual mail
//             await transporter.sendMail({
//                 from: `"Trackd" <${user}>`,
//                 to,
//                 subject,
//                 html: text, // supports HTML templates too
//             });
//
//             console.log(`Email sent successfully via port ${port}`);
//             return {
//                 success: true,
//                 message: `Email sent successfully via port ${port}`,
//             };
//         } catch (err) {
//             console.error(`Failed to send via port ${port}:`, err.message);
//             // Try next port
//         }
//     }
//
//     // If all ports failed
//     return {
//         success: false,
//         message: "Not able to send email using any available port.",
//     };
// }



import { Resend } from "resend";
import { Logger } from "@nestjs/common";

const resend = new Resend(process.env.RESEND_API_KEY);
const logger = new Logger('EmailService');

export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
    try {
        const result = await resend.emails.send({
            from: "Ashish <onboarding@resend.dev>",
            to: process.env.ENV === 'production' ? to : "ashishrajsingh75@gmail.com",
            subject: subject,
            html: `${text}`
        });

        logger.log(`Email sent successfully to ${to}`);
        logger.debug(`Email result: ${JSON.stringify(result)}`);
        return true;
    } catch (error) {
        logger.error(`Failed to send email to ${to}:`, error);
        return false;
    }
}
