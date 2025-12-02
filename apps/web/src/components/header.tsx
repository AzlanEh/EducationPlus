import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const { data: session } = authClient.useSession();
	const links = [{ to: "/", label: "Home" }];

	if (session?.user.role === "admin") {
		links.push({ to: "/admin", label: "Admin" });
	}

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} to={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}
