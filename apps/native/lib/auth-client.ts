import { expoClient } from "@better-auth/expo/client";
import type { auth } from "@eduPlus/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

// Debug: Log the scheme being used
const scheme = Constants.expoConfig?.scheme as string;
console.log("[Auth Client] Initializing with:", {
	scheme,
	baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
	expoConfig: Constants.expoConfig,
});

export const authClient = createAuthClient({
	baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
	plugins: [
		expoClient({
			scheme,
			storagePrefix: scheme,
			storage: SecureStore,
		}),
		inferAdditionalFields<typeof auth>(),
	],
});
