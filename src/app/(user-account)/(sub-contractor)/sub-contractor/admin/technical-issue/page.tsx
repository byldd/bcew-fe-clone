import { Suspense } from "react";
import EmployeeTechnicalIssueTemplate from "@/module/employee-technical-issue/track-ticket/templates/employee-technical-issue-template";

export default function TechnicalIssuePage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<EmployeeTechnicalIssueTemplate />
		</Suspense>
	);
}
