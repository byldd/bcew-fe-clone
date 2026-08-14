import React, { Suspense } from "react";

import JobSiteSafetyIncidentReportsTemplate from "@/module/admin-job-site-safety/templates/job-site-safety-incident-reports-template";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<JobSiteSafetyIncidentReportsTemplate />
		</Suspense>
	);
};

export default Page;
