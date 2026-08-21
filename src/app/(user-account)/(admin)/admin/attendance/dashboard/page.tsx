import React, { Suspense } from "react";

import AttendanceDashboardTemplate from "@/module/admin-attendance/templates/attendance-dashboard-template";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AttendanceDashboardTemplate />
		</Suspense>
	);
};

export default Page;
