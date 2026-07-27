import React, { Suspense } from "react";

import DrivingSafetyPolicies from "@/module/driving-safety/policies/templates/driving-safety-policies";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<DrivingSafetyPolicies />
		</Suspense>
	);
};

export default Page;
