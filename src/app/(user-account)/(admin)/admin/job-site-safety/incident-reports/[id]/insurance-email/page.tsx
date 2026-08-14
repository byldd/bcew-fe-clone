import React, { Suspense } from "react";

import JobSiteSafetyInsuranceEmailReviewTemplate from "@/module/admin-job-site-safety/templates/job-site-safety-insurance-email-review-template";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<JobSiteSafetyInsuranceEmailReviewTemplate id={id} />
		</Suspense>
	);
};

export default Page;
