import React, { Suspense } from "react";

import JobSiteSafetyInjuryReviewTemplate from "@/module/admin-job-site-safety/templates/job-site-safety-injury-review-template";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<JobSiteSafetyInjuryReviewTemplate id={id} />
		</Suspense>
	);
};

export default Page;
