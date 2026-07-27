import WeeklySchedule from "@/module/schedule-management/weekly-schedule-management/templates/weekly-schedule";
import React, { Suspense } from "react";

const WeeklySchedulePage = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<WeeklySchedule />
		</Suspense>
	);
};

export default WeeklySchedulePage;
