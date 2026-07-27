/* eslint-disable no-mixed-spaces-and-tabs */

import { IRoster } from "@/module/schedule-management/roster-time-configuration/types";
import {
	IEmployeeDayTime,
	IJobEmployeeAssignment,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

const getDayTime = (
	dayTimeLog:
		| Pick<IEmployeeDayTime, "dayEndTime" | "dayStartTime" | "overrideEndTime" | "overrideStartTime">
		| undefined
		| null
) => {
	return {
		dayStartTime: dayTimeLog?.overrideStartTime || dayTimeLog?.dayStartTime,
		dayEndTime: dayTimeLog?.overrideEndTime || dayTimeLog?.dayEndTime,
	};
};
const getStopTime = (
	assignment:
		| Pick<IJobEmployeeAssignment, "startTime" | "endTime" | "overrideEndTime" | "overrideStartTime" | "didNotWorked">
		| undefined
		| null
) => {
	return {
		stopStartTime: assignment?.overrideStartTime || assignment?.startTime,
		stopEndTime: assignment?.overrideEndTime || assignment?.endTime,
	};
};
const getRosterTime = (
	roster:
		| Pick<IRoster, "dayEndTime" | "dayStartTime" | "extendedApprovedEndTime" | "extendedApprovedStartTime">
		| undefined
		| null
) => {
	return {
		rosterStartTime: roster?.extendedApprovedStartTime || roster?.dayStartTime,
		rosterEndTime: roster?.extendedApprovedEndTime || roster?.dayEndTime,
	};
};

export { getDayTime, getRosterTime, getStopTime };
