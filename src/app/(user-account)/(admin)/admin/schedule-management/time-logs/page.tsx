import TimeLogs from "@/module/schedule-management/time-logs-management/templates/time-logs";
import { Suspense } from "react";

const TimeLogsPage = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<TimeLogs />
		</Suspense>
	);
};

export default TimeLogsPage;
