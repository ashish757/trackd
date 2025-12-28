import { Resend } from 'resend';
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

/**
 * Email service for sending transactional emails
 * Uses Resend API for email delivery
 */
@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly resend: Resend;
    private readonly isDevelopment: boolean;
    private readonly testEmail: string;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            this.logger.warn('RESEND_API_KEY not found. Email service will not work.');
        }

        this.resend = new Resend(apiKey);
        this.isDevelopment = process.env.ENV !== 'production';
        this.testEmail = process.env.DEV_TEST_EMAIL || 'ashishrajsingh75@gmail.com';
    }

    /**
     * Send an email
     * @param to - Recipient email address
     * @param subject - Email subject
     * @param html - HTML content of the email
     * @returns Promise<boolean> - true if email sent successfully
     */
    async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
        try {
            // In development, redirect all emails to test email
            const recipientEmail = this.isDevelopment ? this.testEmail : to;

            const result = await this.resend.emails.send({
                from: process.env.EMAIL_FROM || 'Trackd <onboarding@resend.dev>',
                to: recipientEmail,
                subject: subject,
                html: html,
            });

            this.logger.log(`Email sent successfully to ${to} (actual: ${recipientEmail})`);
            this.logger.debug(`Email result: ${JSON.stringify(result)}`);

            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error);
            return false;
        }
    }

    /**
     * Send email with retry logic
     * @param to - Recipient email address
     * @param subject - Email subject
     * @param html - HTML content
     * @param maxRetries - Maximum number of retry attempts (default: 3)
     * @returns Promise<boolean>
     */
    async sendEmailWithRetry(
        to: string,
        subject: string,
        html: string,
        maxRetries: number = 3
    ): Promise<boolean> {
        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const success = await this.sendEmail(to, subject, html);
                if (success) return true;

                this.logger.warn(`Email send attempt ${attempt}/${maxRetries} failed for ${to}`);

                // Wait before retrying (exponential backoff)
                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            } catch (error) {
                lastError = error;
                this.logger.error(`Email send attempt ${attempt}/${maxRetries} error:`, error);
            }
        }

        this.logger.error(`Failed to send email to ${to} after ${maxRetries} attempts`);
        return false;
    }

    /**
     * Send bulk emails (with rate limiting consideration)
     * @param emails - Array of email objects {to, subject, html}
     * @returns Promise<{success: number, failed: number}>
     */
    async sendBulkEmails(
        emails: Array<{ to: string; subject: string; html: string }>
    ): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        for (const email of emails) {
            const result = await this.sendEmail(email.to, email.subject, email.html);
            if (result) {
                success++;
            } else {
                failed++;
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.logger.log(`Bulk email send completed. Success: ${success}, Failed: ${failed}`);
        return { success, failed };
    }
}

