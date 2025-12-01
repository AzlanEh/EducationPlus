export type Lesson = {
	id: string;
	title: string;
	durationMinutes: number;
	youtubeId: string;
};

export type Course = {
	id: string;
	title: string;
	image: string;
	durationMinutes: number;
	description?: string;
	instructor?: string;
	lessons: Lesson[];
};

export const courses: Course[] = [
	{
		id: "react-basics",
		title: "React Basics",
		image:
			"https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
		durationMinutes: 180,
		description:
			"Learn core React concepts including components, state, and hooks.",
		instructor: "Jane Doe",
		lessons: [
			{ id: "rb-1", title: "JSX and Components", durationMinutes: 30, youtubeId: "dQw4w9WgXcQ" },
			{ id: "rb-2", title: "Props and State", durationMinutes: 30, youtubeId: "M_AQi6jM8tY" },
			{ id: "rb-3", title: "Hooks Overview", durationMinutes: 45, youtubeId: "dpw9EHDh2bM" },
			{ id: "rb-4", title: "Effects and Lifecycle", durationMinutes: 45, youtubeId: "k_H_WjC2mFk" },
			{ id: "rb-5", title: "Project Setup", durationMinutes: 30, youtubeId: "bMknfKXLg7Q" },
		],
	},
	{
		id: "ts-advanced",
		title: "TypeScript Advanced",
		image:
			"https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
		durationMinutes: 240,
		description:
			"Deep-dive into TypeScript generics, utility types, and inference.",
		instructor: "Alex Kim",
		lessons: [
			{ id: "ts-1", title: "Generics", durationMinutes: 40, youtubeId: "BmeC_d_9-E4" },
			{ id: "ts-2", title: "Utility Types", durationMinutes: 40, youtubeId: "sD9_JzI4_2c" },
			{ id: "ts-3", title: "Type Narrowing", durationMinutes: 40, youtubeId: "3dK0v42r78U" },
			{ id: "ts-4", title: "Mapped Types", durationMinutes: 60, youtubeId: "h-PzE11w2D0" },
			{ id: "ts-5", title: "Advanced Inference", durationMinutes: 60, youtubeId: "Z5cZ_G835hM" },
		],
	},
	{
		id: "rn-ui",
		title: "React Native UI",
		image:
			"https://images.unsplash.com/photo-1547658719-c1c8a4f6c3a5?w=800&q=80",
		durationMinutes: 200,
		description: "Build beautiful mobile UIs with navigation and animations.",
		instructor: "Sam Lee",
		lessons: [
			{ id: "rn-1", title: "Layouts and Flexbox", durationMinutes: 45, youtubeId: "n0Fh4sL6gI0" },
			{ id: "rn-2", title: "Navigation", durationMinutes: 45, youtubeId: "0-S5a0e-M_0" },
			{ id: "rn-3", title: "Animations", durationMinutes: 55, youtubeId: "Ld2CH4iBfBc" },
			{ id: "rn-4", title: "Theming", durationMinutes: 55, youtubeId: "zVjYt2k1e30" },
		],
	},
];
