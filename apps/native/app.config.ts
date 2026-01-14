export default {
	expo: {
		scheme: "eduPlus",
		userInterfaceStyle: "automatic",
		orientation: "default",
		web: {
			bundler: "metro",
		},
		name: "eduPlus",
		slug: "eduPlus",
		plugins: [
			"expo-font",
			[
				"expo-splash-screen",
				{
					image: "./assets/icons/splash-icon-dark.png",
					imageWidth: 200,
					resizeMode: "contain",
					backgroundColor: "#ffffff",
					dark: {
						image: "./assets/icons/splash-icon-light.png",
						backgroundColor: "#000000",
					},
				},
			],
		],
		experiments: {
			typedRoutes: true,
			reactCompiler: true,
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/icons/adaptive-icon.png",
				monochromeImage: "./assets/icons/adaptive-icon.png",
				backgroundColor: "#FFFFFF",
			},
			package: "com.anonymous.eduPlus",
			// Allow HTTP traffic during development (remove for production builds)
			usesCleartextTraffic: true,
		},
		ios: {
			bundleIdentifier: "com.anonymous.eduPlus",
			icon: {
				dark: "./assets/icons/ios-icon-dark.png",
				light: "./assets/icons/ios-icon-light.png",
				tinted: "./assets/icons/ios-icon-tinted.png",
			},
		},
		extra: {
			eas: {
				projectId: "eeacf867-78c3-4105-8637-975881c945aa",
			},
		},
	},
};
