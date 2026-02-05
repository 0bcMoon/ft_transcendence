import env from "../env";

export function resetPasswordEmailTemplate(reset_code: string) {
    const reset_link = `${env.FRONTEND_URL}/reset-password?reset_code=${reset_code}`;

    return `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px; text-align: center; color: #334155;">
              <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background: #000; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: #fff; font-size: 30px;">🔑</span>
                </div>
                
                <h1 style="font-size: 28px; margin-bottom: 16px;">Reset Password</h1>
                <p style="font-size: 16px; line-height: 1.5; color: #64748b; margin-bottom: 32px;">
                  We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
                </p>

                <a href="${reset_link}" style="background-color: #dc2626; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Reset My Password
                </a>

                <p style="font-size: 14px; color: #94a3b8; margin-top: 40px;">
                  This link will expire in 15 minutes for security reasons.
                </p>
              </div>

              <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
                © 2026 Ping Pong. All rights reserved.
              </p>
            </div>
        `;

}

export function emailConfirmationTemplate(code: string) {
    return `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px; text-align: center; color: #334155;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background: #000; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
              <span style="color: #fff; font-size: 30px;"> ✉️ </span>
            </div>
            <h1 style="font-size: 28px; margin-bottom: 16px;">Verify Your Email</h1>
            <p style="font-size: 16px; line-height: 1.5; color: #64748b; margin-bottom: 32px;">
              Thanks for signing up! Please confirm your email address to activate your account.
            </p>
            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 8px; font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #0f172a; margin-bottom: 32px;">
                ${code}
            </div>
            <p style="font-size: 14px; color: #94a3b8; margin-top: 40px;">
              Button not working? Copy and paste this link into your browser:<br>
            </p>
          </div>

          <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
            © 2026 Ping Pong. All rights reserved.
          </p>
        </div>
    `;
}

export function otpConfirmationTemplate(code: string) {
    return `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px; text-align: center; color: #334155;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background: #000; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
              <span style="color: #fff; font-size: 30px;">🔒</span>
            </div>
            
            <h1 style="font-size: 28px; margin-bottom: 16px;">Your OTP Code 🔐</h1>
            <p style="font-size: 16px; line-height: 1.5; color: #64748b; margin-bottom: 32px;">
              Use the code below to complete your authentication. This code will expire in 15 minutes.
            </p>

            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 8px; font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #0f172a; margin-bottom: 32px;">
                ${code}
            </div>

            <p style="font-size: 14px; color: #94a3b8; margin-top: 24px;">
              If you didn't request this, please ignore this email or contact support.
            </p>
          </div>
          <div style="margin-top: 24px; font-size: 12px; color: #cbd5e1;">
            This is an automated security notification.
          </div>

          <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
            © 2026 Ping Pong. All rights reserved.
          </p>

        </div>
    `;
}

export function twoFactorAuthTemplate(code: string) {
    return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px; text-align: center; color: #1e293b;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
    
    <div style="background: #0f172a; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
      <span style="color: #fff; font-size: 32px;">🛡️</span>
    </div>
    
    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #0f172a;">Two-Factor Authentication</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #64748b; margin-bottom: 32px;">
      Enter the following code to verify your identity and complete the sign-in process.
    </p>

    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; border: 2px dashed #cbd5e1; margin-bottom: 32px;">
      <span style="font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #0f172a; font-family: monospace;">
        ${code}
      </span>
    </div>

    <p style="font-size: 14px; color: #94a3b8; margin-bottom: 8px;">
      This code is valid for <b>15 minutes</b>.
    </p>
    
    <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 24px;">
      <p style="font-size: 13px; color: #64748b; line-height: 1.4;">
        <b>Security Tip:</b> If you didn't attempt to log in, someone may have your password. We recommend changing it immediately.
      </p>
    </div>

  </div>
  
  <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
    © 2026 Ping Pong. All rights reserved.
  </p>
</div>`
}
