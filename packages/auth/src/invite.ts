import crypto from "node:crypto";
import { Invite, User } from "@eduPlus/db/models/auth.model";

// Generate secure invite token
export function generateInviteToken(): string {
	return crypto.randomBytes(32).toString("hex");
}

// Create admin invite
export async function createAdminInvite(
	email: string,
	createdBy: string,
): Promise<string> {
	// Check if user already exists
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new Error("User with this email already exists");
	}

	// Check if invite already exists and is unused
	const existingInvite = await Invite.findOne({ email, used: false });
	if (existingInvite) {
		throw new Error("Invite already exists for this email");
	}

	const token = generateInviteToken();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

	await Invite.create({
		email,
		token,
		expiresAt,
		createdBy,
	});

	return token;
}

// Validate invite token
export async function validateInviteToken(
	token: string,
	email: string,
): Promise<boolean> {
	const invite = await Invite.findOne({
		token,
		email,
		used: false,
		expiresAt: { $gt: new Date() },
	});

	return !!invite;
}

// Get invite by token
export async function getInviteByToken(token: string) {
	return await Invite.findOne({
		token,
		used: false,
		expiresAt: { $gt: new Date() },
	});
}

// Mark invite as used
export async function markInviteAsUsed(token: string): Promise<void> {
	await Invite.findOneAndUpdate({ token }, { used: true });
}

// Clean up expired invites
export async function cleanupExpiredInvites(): Promise<void> {
	await Invite.deleteMany({ expiresAt: { $lt: new Date() } });
}

// Get all invites (for admin management)
export async function getAllInvites() {
	return await Invite.find({})
		.populate("createdBy", "name email")
		.sort({ createdAt: -1 });
}
