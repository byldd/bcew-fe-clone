import Teams from "@/module/team/template/teams";
import { Suspense } from "react";

export default function TeamsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Teams />
		</Suspense>
	);
}
