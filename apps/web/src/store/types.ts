// Auth types for the application
// Using Better-Auth session types directly

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	role: "student" | "admin";
	target?: string;
	gender?: "male" | "female" | "other";
	phoneNo?: string;
	signupSource: "native" | "web";
	createdAt: Date;
	updatedAt: Date;
}

export interface AuthSession {
	user: AuthUser;
	session: {
		id: string;
		userId: string;
		expiresAt: Date;
		token: string;
	};
}

export interface Lesson {
	id: string;
	title: string;
	completed: boolean;
}

export interface Course {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
	duration: string;
	progress: number;
	lessons: Lesson[];
}

export interface ThemeState {
	theme: "light" | "dark" | "system";
}

export interface CoursesState {
	courses: Course[];
	selectedCourse: Course | null;
	isLoading: boolean;
}

export interface AppState {
	isLoading: boolean;
	error: string | null;
}
