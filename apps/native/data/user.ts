export type User = {
	name: string;
	email: string;
	avatar: string;
	location?: string;
	rank?: number;
	documents?: number;
	downloads?: number;
};

export const initialUser: User = {
	name: "MD Meraz Nadim",
	email: "meraz.nadim@example.com",
	avatar:
		"https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=300&q=80",
	location: "Bhagalpur city",
	rank: 12,
	documents: 200,
	downloads: 40,
};
