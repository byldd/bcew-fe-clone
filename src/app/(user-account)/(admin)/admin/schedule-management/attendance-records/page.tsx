import AttendanceRecords from "@/module/schedule-management/attendance-records/templeates/attendance-records";
import { Suspense } from "react";

const TimeLogsPage = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AttendanceRecords />
		</Suspense>
	);
};

export default TimeLogsPage;
