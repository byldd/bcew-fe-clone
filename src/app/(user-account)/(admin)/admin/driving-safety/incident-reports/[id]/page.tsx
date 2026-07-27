import React, { Suspense } from "react";

import AccidentReportReview from "@/module/driving-safety/incident-reports/templates/accident-report-review";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AccidentReportReview reportId={id} />
		</Suspense>
	);
};

export default Page;
