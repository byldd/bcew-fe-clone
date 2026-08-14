import React, { Suspense } from "react";

import JobSiteSafetyViolationInsuranceEmailReviewTemplate from "@/module/admin-job-site-safety/templates/job-site-safety-violation-insurance-email-review-template";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<JobSiteSafetyViolationInsuranceEmailReviewTemplate id={id} />
		</Suspense>
	);
};

export default Page;
