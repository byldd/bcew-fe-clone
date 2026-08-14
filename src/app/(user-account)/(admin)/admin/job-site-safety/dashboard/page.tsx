import React, { Suspense } from "react";

import JobSiteSafetyDashboardTemplate from "@/module/admin-job-site-safety/templates/job-site-safety-dashboard-template";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<JobSiteSafetyDashboardTemplate />
		</Suspense>
	);
};

export default Page;
