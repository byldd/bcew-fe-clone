import ReleaseNotePage from "@/module/employee-release-notes/templates/release-notes";
import { Suspense } from "react";

export default function ReleaseNotes() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ReleaseNotePage />
		</Suspense>
	);
}
