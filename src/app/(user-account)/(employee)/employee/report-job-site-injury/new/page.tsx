"use client";
import { Suspense } from "react";
import NewJobSiteInjuryReportTemplate from "@/module/employee-safety/templates/new-job-site-injury-report-template";
import { useSearchParams } from "next/navigation";

function NewJobSiteInjuryReportPageContent() {
	const searchParams = useSearchParams();
	const draftId = searchParams.get("draftId");

	// Keyed by draftId so navigating between reports (e.g. from My Records) always
	// mounts a fresh instance instead of reusing state from whatever report/blank
	// form was open before — otherwise stale form/query state can linger across
	// same-route navigations.
	return <NewJobSiteInjuryReportTemplate key={draftId} />;
}

export default function NewJobSiteInjuryReportPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<NewJobSiteInjuryReportPageContent />
		</Suspense>
	);
}
