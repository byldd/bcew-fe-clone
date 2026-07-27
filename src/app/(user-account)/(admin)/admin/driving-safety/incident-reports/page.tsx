import React, { Suspense } from "react";

import IncidentReports from "@/module/driving-safety/incident-reports/templates/incident-reports";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<IncidentReports />
		</Suspense>
	);
};

export default Page;
