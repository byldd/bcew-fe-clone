import React, { Suspense } from "react";

import ViolationReportReview from "@/module/driving-safety/incident-reports/templates/violation-report-review";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ViolationReportReview reportId={id} />
		</Suspense>
	);
};

export default Page;
