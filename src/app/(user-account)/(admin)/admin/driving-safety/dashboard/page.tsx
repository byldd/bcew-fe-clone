import React, { Suspense } from "react";

import DrivingSafetyDashboard from "@/module/driving-safety/dashboard/templates/driving-safety-dashboard";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<DrivingSafetyDashboard />
		</Suspense>
	);
};

export default Page;
