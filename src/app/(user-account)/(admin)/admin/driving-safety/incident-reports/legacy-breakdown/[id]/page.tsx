import React, { Suspense } from "react";

import LegacyBreakdownReview from "@/module/driving-safety/incident-reports/templates/legacy-breakdown-review";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LegacyBreakdownReview reportId={id} />
		</Suspense>
	);
};

export default Page;
