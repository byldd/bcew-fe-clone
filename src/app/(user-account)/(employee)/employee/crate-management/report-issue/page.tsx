import { Suspense } from "react";
import ReportCrateIssueTemplate from "@/module/crate-management/templates/report-crate-issue";

export default function ReportCrateIssuePage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ReportCrateIssueTemplate />
		</Suspense>
	);
}
