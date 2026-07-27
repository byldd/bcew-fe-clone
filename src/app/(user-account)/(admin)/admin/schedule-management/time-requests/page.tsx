import TimeRequests from "@/module/schedule-management/time-requests/time-requests";
import { Suspense } from "react";

const TimeRequestPage = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<TimeRequests />
		</Suspense>
	);
};

export default TimeRequestPage;
