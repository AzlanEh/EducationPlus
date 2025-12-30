import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
	try {
		const result = await resend.emails.send({
			from: process.env.EMAIL_FROM || "eduPlus@azlaneh.qzz.io",
			to,
			subject,
			html,
		});
		return result;
	} catch (error) {
		console.error("Email sending failed:", error);
		throw error;
	}
}
