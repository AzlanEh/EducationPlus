import crypto from "node:crypto";
import { OTP, User } from "@eduPlus/db/models/auth.model";
import nodemailer from "nodemailer";

// Email transporter
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

// Generate 6-digit OTP
export function generateOTP(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash OTP for storage
export function hashOTP(otp: string): string {
	return crypto.createHash("sha256").update(otp).digest("hex");
}

// Verify OTP
export function verifyOTP(otp: string, hash: string): boolean {
	return hashOTP(otp) === hash;
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
	const mailOptions = {
		from: process.env.SMTP_FROM || "noreply@eduplus.com",
		to: email,
		subject: "Your OTP for eduPlus Verification",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to eduPlus!</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
	};

	await transporter.sendMail(mailOptions);
}

// Create and send OTP for user
export async function createAndSendOTP(
	userId: string,
	purpose: "signup" | "forgot-password" = "signup",
): Promise<void> {
	const user = await User.findById(userId);
	if (!user) {
		throw new Error("User not found");
	}

	// Generate OTP
	const otp = generateOTP();
	const otpHash = hashOTP(otp);
	const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

	// Save OTP to database
	await OTP.create({
		userId,
		otpHash,
		expiresAt,
		purpose,
	});

	// Send email
	await sendOTPEmail(user.email, otp);
}

// Verify OTP and mark email as verified
export async function verifyUserOTP(
	userId: string,
	otp: string,
): Promise<boolean> {
	const otpRecord = await OTP.findOne({
		userId,
		expiresAt: { $gt: new Date() },
		purpose: "signup",
	}).sort({ createdAt: -1 });

	if (!otpRecord) {
		return false;
	}

	const isValid = verifyOTP(otp, otpRecord.otpHash);

	if (isValid) {
		// Mark email as verified
		await User.findByIdAndUpdate(userId, { emailVerified: true });
		// Delete used OTP
		await OTP.findByIdAndDelete(otpRecord._id);
		return true;
	}

	return false;
}

// Clean up expired OTPs (can be called periodically)
export async function cleanupExpiredOTPs(): Promise<void> {
	await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
}
