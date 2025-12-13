/**
 * Base email wrapper template with consistent styling
 */
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trackd</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f6f9fc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
        }
        .email-logo {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            margin: 0;
            letter-spacing: 2px;
        }
        .email-body {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }
        .email-footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #64748b;
        }
        .button {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .otp-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            font-size: 36px;
            font-weight: bold;
            padding: 20px;
            text-align: center;
            border-radius: 10px;
            margin: 25px 0;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .info-box {
            background-color: #f1f5f9;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
            color: #991b1b;
        }
        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 30px 0;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }
        @media only screen and (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }
            .otp-box {
                font-size: 28px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div style="background-color: #f6f9fc; padding: 20px;">
        <div class="email-container">
            <div class="email-header">
                <h1 class="email-logo">TRACKD</h1>
            </div>
            ${content}
            <div class="email-footer">
                <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Trackd. All rights reserved.</p>
                <p style="margin: 0 0 10px 0;">Track your favorite movies with friends</p>
                <div class="social-links">
                    <a href="#">Privacy Policy</a> •
                    <a href="#">Terms of Service</a> •
                    <a href="#">Contact Us</a>
                </div>
                <p style="margin: 20px 0 0 0; color: #94a3b8;">
                    This is an automated email, please do not reply to this message.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const verifyChangeEmailTemplate = (name: string, link: string) => {
    const content = `
        <div class="email-body">
            <h2 style="color: #1e293b; margin-top: 0;">Email Verification Required</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>We received a request to change your email address. To complete this process, please verify your new email by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="${link}" class="button">Verify New Email</a>
            </div>
            
            <div class="info-box">
                <strong>⏱ This link will expire in 15 minutes</strong>
            </div>
            
            <div class="warning-box">
                <strong>⚠️ Security Notice:</strong> If you didn't request this email change, please ignore this message and consider changing your password.
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #64748b; font-size: 14px;">
                <strong>Having trouble?</strong> Copy and paste this link into your browser:<br>
                <span style="word-break: break-all; color: #667eea;">${link}</span>
            </p>
        </div>
    `;
    return emailWrapper(content);
};

export const changeEmailRequestTemplate = (name: string, newEmail: string) => {
    const content = `
        <div class="email-body">
            <h2 style="color: #1e293b; margin-top: 0;">Email Change Request</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>We wanted to notify you that a request has been made to change your account email to:</p>
            
            <div class="info-box" style="text-align: center;">
                <strong style="font-size: 18px; color: #667eea;">${newEmail}</strong>
            </div>
            
            <p>A verification email has been sent to the new email address. The change will only take effect once the new email is verified.</p>
            
            <div class="warning-box">
                <strong>⚠️ Security Alert:</strong> If you didn't make this request, please contact our support team immediately and consider changing your password.
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #64748b; font-size: 14px;">
                This is a security notification to keep you informed about changes to your account.
            </p>
        </div>
    `;
    return emailWrapper(content);
};

export const emailChangedSuccessTemplate = (name: string, newEmail: string) => {
    const content = `
        <div class="email-body">
            <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 48px;">✅</span>
            </div>
            
            <h2 style="color: #1e293b; margin-top: 0; text-align: center;">Email Successfully Updated</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your email address has been successfully updated. Your new email address is:</p>
            
            <div class="info-box" style="text-align: center;">
                <strong style="font-size: 18px; color: #667eea;">${newEmail}</strong>
            </div>
            
            <p>You can now use this email address to sign in to your account.</p>
            
            <div class="warning-box">
                <strong>⚠️ Did you make this change?</strong><br>
                If you didn't perform this action, please contact our support team immediately. Your account security is important to us.
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center;">
                Thank you for using Trackd!
            </p>
        </div>
    `;
    return emailWrapper(content);
};

export const otpTemplate = (name: string, otp: string) => {
    const content = `
        <div class="email-body">
            <h2 style="color: #1e293b; margin-top: 0;">Email Verification Code</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for signing up with Trackd! Please use the verification code below to complete your registration:</p>
            
            <div class="otp-box">
                ${otp}
            </div>
            
            <div class="info-box">
                <strong>⏱ This code will expire in 3 minutes</strong><br>
                <span style="color: #64748b;">For security reasons, please do not share this code with anyone.</span>
            </div>
            
            <p>Enter this code in the verification screen to activate your account and start tracking movies!</p>
            
            <div class="warning-box">
                <strong>⚠️ Didn't request this code?</strong><br>
                If you didn't attempt to create an account, please ignore this email. No account will be created without entering this code.
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #64748b; font-size: 14px;">
                Welcome to the Trackd community! Once verified, you'll be able to discover movies, create lists, and connect with friends.
            </p>
        </div>
    `;
    return emailWrapper(content);
};

export const passwordResetTemplate = (name: string, resetLink: string) => {
    const content = `
        <div class="email-body">
            <h2 style="color: #1e293b; margin-top: 0;">Reset Your Password</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>We received a request to reset the password for your Trackd account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <div class="info-box">
                <strong>⏱ This link will expire in 15 minutes</strong><br>
                <span style="color: #64748b;">For your security, password reset links are only valid for a short period.</span>
            </div>
            
            <div class="warning-box">
                <strong>⚠️ Didn't request a password reset?</strong><br>
                If you didn't make this request, you can safely ignore this email. Your password will remain unchanged.
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #64748b; font-size: 14px;">
                <strong>Having trouble?</strong> Copy and paste this link into your browser:<br>
                <span style="word-break: break-all; color: #667eea;">${resetLink}</span>
            </p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                <p style="margin: 0; color: #64748b; font-size: 14px;">
                    <strong>Security Tips:</strong>
                </p>
                <ul style="color: #64748b; font-size: 14px; margin: 10px 0;">
                    <li>Use a strong, unique password</li>
                    <li>Never share your password with anyone</li>
                    <li>Consider using a password manager</li>
                </ul>
            </div>
        </div>
    `;
    return emailWrapper(content);
};

