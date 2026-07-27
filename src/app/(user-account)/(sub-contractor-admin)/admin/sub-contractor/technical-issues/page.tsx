import AdminTechnicalIssuesPage from "@/module/admin-technical-issues/templates/technical-issues-list";
import { Suspense } from "react";

export default function TechnicalIssues() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AdminTechnicalIssuesPage />
		</Suspense>
	);
}
