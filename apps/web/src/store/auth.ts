// Auth store is deprecated - use authClient.useSession() from @/lib/auth-client instead
// This file is kept for backward compatibility but will be removed in a future version

import { create } from "zustand";

// Empty store - auth state is now managed by Better-Auth
interface AuthStore {
	_deprecated: boolean;
}

export const useAuthStore = create<AuthStore>()(() => ({
	_deprecated: true,
}));

// Re-export for convenience - prefer using authClient.useSession() directly
export { authClient } from "@/lib/auth-client";
