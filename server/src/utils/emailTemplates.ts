export const verifyChangeEmailTemplate = (name: string, link: string) => {
    return `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Hello,</h2>
    <p>Click Below to verify and change you older email to this</p>
    <a href="${link}" style="display: inline-block; padding: 10px 18px; background: #007bff; color: #fff; border-radius: 6px; text-decoration: none;">Verify Email</a>
    <p>If you didn’t request this, you can safely ignore this email.</p>
    <br>
    <p>Cheers,<br>The Team</p>
  </div>`;
};


export const changeEmailRequestTemplate = (name: string, newEmail: string) => {
    return `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Hello ${name},</h2>
    <p>We received a request to change your account email to: <strong>${newEmail}</strong></p>
    <p>If you didn’t make this request, please contact our support immediately.</p>
    <br>
    <p>Thanks,<br>The Team</p>
  </div>`;
};


export const emailChangedSuccessTemplate = (name: string, newEmail: string) => {
    return `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Hello ${name},</h2>
    <p>Your email has been successfully updated to:</p>
    <p><strong>${newEmail}</strong></p>
    <p>If you didn't perform this change, contact our support immediately.</p>
    <br>
    <p>Regards,<br>The Team</p>
  </div>`;
};


export const otpTemplate = (name, otp) => `
  <div style="
    font-family: Arial, sans-serif;
    background-color: #f6f9fc;
    padding: 20px;
    border-radius: 10px;
    color: #333;
  ">
    <div style="
      max-width: 500px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    ">
      <h2 style="text-align:center; color:#2563eb;">Trackd - Email Verification</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Here’s your one-time verification code:</p>
      
      <div style="
        text-align:center;
        font-size: 28px;
        font-weight: bold;
        color: #2563eb;
        margin: 15px 0;
      ">
        ${otp}
      </div>
      
      <p>This code is valid for <strong>3 minutes</strong>.</p>
      <p>If you didn’t request this, please ignore this email.</p>
      
      <hr style="margin-top:25px; border:none; border-top:1px solid #eee;">
      <p style="text-align:center; font-size:12px; color:#777;">
        © ${new Date().getFullYear()} Trackd. All rights reserved.
      </p>
    </div>
  </div>
`;

export const passwordResetTemplate = (name: string, resetLink: string) => `
  <div style="
    font-family: Arial, sans-serif;
    background-color: #f6f9fc;
    padding: 20px;
    border-radius: 10px;
    color: #333;
  ">
    <div style="
      max-width: 500px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    ">
      <h2 style="text-align:center; color:#2563eb;">Trackd - Password Reset</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      
      <div style="text-align:center; margin: 20px 0;">
        <a href="${resetLink}" style="
          background-color: #2563eb;
          color: #ffffff;
          padding: 12px 20px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">Reset Password</a>
      </div>
      
      <p>This link is valid for <strong>15 minutes</strong>.</p>
      <p>If you didn’t request a password reset, please ignore this email.</p>
      
      <hr style="margin-top:25px; border:none; border-top:1px solid #eee;">
      <p style="text-align:center; font-size:12px; color:#777;">
        © ${new Date().getFullYear()} Trackd. All rights reserved.
      </p>
    </div>
  </div>
`;
