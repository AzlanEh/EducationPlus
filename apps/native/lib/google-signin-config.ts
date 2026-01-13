import Constants from "expo-constants";

// Configure Google Sign-In for mobile
export function configureGoogleSignIn() {
	try {
		// Dynamically import to avoid crashes if module is not available
		const {
			GoogleSignin,
		} = require("@react-native-google-signin/google-signin");

		GoogleSignin.configure({
			// Get the client ID from environment or app config
			webClientId:
				process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID ||
				Constants.expoConfig?.extra?.webGoogleClientId,
			iosClientId:
				process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID ||
				Constants.expoConfig?.extra?.iosGoogleClientId,
			offlineAccess: true, // Request refresh token
		});
	} catch (error) {
		console.warn("Google Sign-In not available:", error);
		// Continue without Google Sign-In configuration
	}
}
