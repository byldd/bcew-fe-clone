import React, { Suspense } from "react";

import SafetyPoliciesTemplate from "@/module/employee-safety/templates/safety-policies-template";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SafetyPoliciesTemplate />
		</Suspense>
	);
};

export default Page;
