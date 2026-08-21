import React, { Suspense } from "react";

import LegacyAccidentReview from "@/module/driving-safety/incident-reports/templates/legacy-accident-review";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LegacyAccidentReview reportId={id} />
		</Suspense>
	);
};

export default Page;
