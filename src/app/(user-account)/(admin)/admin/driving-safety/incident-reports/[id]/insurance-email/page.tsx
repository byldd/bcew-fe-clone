import React, { Suspense } from "react";

import InsuranceEmailReview from "@/module/driving-safety/incident-reports/templates/insurance-email-review";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<InsuranceEmailReview reportId={id} />
		</Suspense>
	);
};

export default Page;
