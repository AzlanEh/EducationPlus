import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function getVerificationEmailHTML(otp: string): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .code { font-size: 32px; font-weight: bold; color: #1f2937; text-align: center; margin: 30px 0; padding: 20px; background: #f3f4f6; border-radius: 8px; letter-spacing: 4px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        .support { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">eduPlus</div>
        <p>Education Platform</p>
    </div>

    <h2>Verify your email address</h2>

    <p>Thank you for signing up for eduPlus. To complete your registration, please use the verification code below:</p>

    <div class="code">${otp}</div>

    <p>This code will expire in 10 minutes for security reasons.</p>

    <p>If you didn't create an account with eduPlus, you can safely ignore this email.</p>

    <div class="footer">
        <p>Best regards,<br>The eduPlus Team</p>

        <div class="support">
            <p>Questions? Contact our support team at <a href="mailto:support@azlaneh.qzz.io">support@azlaneh.qzz.io</a></p>
            <p>You can also unsubscribe from these emails by replying to this message.</p>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            eduPlus<br>
            Azlan Education Hub<br>
            [Your Address Here]
        </p>
    </div>
</body>
</html>
	`.trim();
}

export function getPasswordResetEmailHTML(url: string): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        .support { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">eduPlus</div>
        <p>Education Platform</p>
    </div>

    <h2>Reset your password</h2>

    <p>We received a request to reset your password for your eduPlus account. Click the button below to set a new password:</p>

    <a href="${url}" class="button">Reset Password</a>

    <p>This link will expire in 1 hour for security reasons.</p>

    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

    <div class="footer">
        <p>Best regards,<br>The eduPlus Team</p>

        <div class="support">
            <p>Questions? Contact our support team at <a href="mailto:support@azlaneh.qzz.io">support@azlaneh.qzz.io</a></p>
            <p>You can also unsubscribe from these emails by replying to this message.</p>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            eduPlus<br>
            Azlan Education Hub<br>
            [Your Address Here]
        </p>
    </div>
</body>
</html>
	`.trim();
}

export async function sendEmail(to: string, subject: string, html: string) {
	try {
		console.log(`Sending email to ${to} with subject: ${subject}`);
		const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev"; // Use Resend's test domain
		const result = await resend.emails.send({
			from: fromEmail,
			to,
			subject,
			html,
			replyTo: "support@azlaneh.qzz.io", // Add reply-to for support
		});

		if (result.error) {
			console.error("Email sending error:", result.error);
			// For development, log the OTP directly to console as fallback
			console.log(
				`DEV MODE: OTP would be sent to ${to}. Check your email or use console OTP above.`,
			);
		} else {
			console.log(`Email sent successfully to ${to}`);
		}
		return result;
	} catch (error) {
		console.error("Email sending failed:", error);
		// For development, don't throw - just log
		console.log(
			"DEV MODE: Email failed, but continuing. Check logs above for OTP.",
		);
		return { error };
	}
}
