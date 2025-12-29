export interface User {
	id: string;
	name: string;
	email: string;
	bio?: string;
	avatarUrl?: string;
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

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
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
