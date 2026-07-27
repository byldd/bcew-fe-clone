"use client";
import React from "react";

import HeaderToolbar from "../components/header-toolbar";

import ScheduleCalendar from "../components/calendar/schedule-calendar";
import { ScheduleProvider } from "../context/schedule-context";

const WeeklySchedule = () => {
	return (
		<ScheduleProvider>
			<div className="flex flex-1 flex-col space-y-4 overflow-hidden">
				<HeaderToolbar />
				<ScheduleCalendar />
			</div>
		</ScheduleProvider>
	);
};

export default WeeklySchedule;
