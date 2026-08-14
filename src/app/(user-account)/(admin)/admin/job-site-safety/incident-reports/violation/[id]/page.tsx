import React, { Suspense } from "react";

import JobSiteSafetyViolationReviewTemplate from "@/module/admin-job-site-safety/templates/job-site-safety-violation-review-template";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<JobSiteSafetyViolationReviewTemplate id={id} />
		</Suspense>
	);
};

export default Page;
