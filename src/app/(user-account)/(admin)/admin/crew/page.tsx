import CrewList from "@/module/crew/template/crews";
import { Suspense } from "react";
export default function Crew() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CrewList />
		</Suspense>
	);
}
