import JobLevelDetailsPage from "@/module/job-level-details/templates/job-level-details-template";
import { Suspense } from "react";

export default function JobLevelDetails() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<JobLevelDetailsPage />
		</Suspense>
	);
}
