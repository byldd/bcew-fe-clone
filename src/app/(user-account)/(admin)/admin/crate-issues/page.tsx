import AdminCrateIssuesPage from "@/module/admin-crate-issues/templates/crate-issues-page";
import { Suspense } from "react";

export default function CrateIssues() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AdminCrateIssuesPage />
		</Suspense>
	);
}
