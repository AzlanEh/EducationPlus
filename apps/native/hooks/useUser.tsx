import { createContext, useContext, useState } from "react";
import { initialUser, type User } from "@/data/user";

type UserContextValue = {
	user: User;
	update: (patch: Partial<User>) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User>(initialUser);
	const update = (patch: Partial<User>) => setUser((u) => ({ ...u, ...patch }));
	return (
		<UserContext.Provider value={{ user, update }}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("UserProvider missing");
	return ctx;
}
