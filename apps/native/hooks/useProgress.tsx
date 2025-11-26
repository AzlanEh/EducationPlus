import { createContext, useContext, useMemo, useReducer } from "react";

type ProgressState = Record<string, boolean>;

type Action = { type: "toggle"; lessonId: string; completed?: boolean };

function reducer(state: ProgressState, action: Action): ProgressState {
	if (action.type === "toggle") {
		const next = action.completed ?? !state[action.lessonId];
		return { ...state, [action.lessonId]: next };
	}
	return state;
}

type ProgressContextValue = {
	state: ProgressState;
	toggle: (lessonId: string, completed?: boolean) => void;
	getCourseProgress: (lessonIds: string[]) => number;
	isLessonCompleted: (lessonId: string) => boolean;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(reducer, {});

	const value = useMemo<ProgressContextValue>(() => {
		const toggle = (lessonId: string, completed?: boolean) =>
			dispatch({ type: "toggle", lessonId, completed });
		const getCourseProgress = (lessonIds: string[]) => {
			if (!lessonIds.length) return 0;
			const done = lessonIds.filter((id) => state[id]).length;
			return Math.round((done / lessonIds.length) * 100);
		};
		const isLessonCompleted = (lessonId: string) => !!state[lessonId];
		return { state, toggle, getCourseProgress, isLessonCompleted };
	}, [state]);

	return (
		<ProgressContext.Provider value={value}>
			{children}
		</ProgressContext.Provider>
	);
}

export function useProgress() {
	const ctx = useContext(ProgressContext);
	if (!ctx) throw new Error("ProgressProvider missing");
	return ctx;
}
