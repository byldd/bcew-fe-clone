import AdminReleaseNotesPage from "@/module/admin-release-notes/templates/release-notes-list";
import { Suspense } from "react";

export default function ReleaseNotes() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AdminReleaseNotesPage />
		</Suspense>
	);
}
