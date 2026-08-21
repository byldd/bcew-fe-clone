import React, { Suspense } from "react";

import BreakdownReportReview from "@/module/driving-safety/incident-reports/templates/breakdown-report-review";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<BreakdownReportReview reportId={id} />
		</Suspense>
	);
};

export default Page;
