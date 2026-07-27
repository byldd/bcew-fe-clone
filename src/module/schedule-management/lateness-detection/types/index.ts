import { OptionYesNo, TIME_VARIANCE_TYPE } from "@/utils/enums";
import { AttendanceStatus, IEmployeeDayTime } from "../../weekly-schedule-management/types/schedule-interface";
import { IRoster } from "../../roster-time-configuration/types";

export interface ILateEmployeeResponse {
	type: TIME_VARIANCE_TYPE.LATE_ARRIVAL | TIME_VARIANCE_TYPE.EARLY_LOGOUT | TIME_VARIANCE_TYPE.BOTH;

	user: {
		id: string;
		name: string;
		team: { id: string; name: string } | null;
		employee: {
			id: string;
			bcewEmployeeNumber: number;
			crew: { id: string; name: string } | null;
		};
	};

	employeeDayTime: {
		id: string;
		employeeId: string;
		dayStartTime: Date | string | null;
		dayEndTime: Date | string | null;
		overrideStartTime: Date | string | null;
		overrideEndTime: Date | string | null;
		rawStartTime: Date | string | null;
		rawEndTime: Date | string | null;
		date: Date | string;

		lateResponse: OptionYesNo | null;
		lateEmployeeReason: string | null;
		lateAdminNote: string | null;
		isLatenessHandled: boolean | null;

		earlyOutResponse: OptionYesNo | null;
		earlyOutEmployeeReason: string | null;
		earlyOutAdminNote: string | null;
		isEarlyOutHandled: boolean | null;

		lateClaimedStartTime?: Date | string | null;
		earlyClaimedEndTime?: Date | string | null;

		lateStatus?: AttendanceStatus | null;
		earlyOutStatus?: AttendanceStatus | null;

		isRunning: boolean;
	} | null;

	roster: {
		id: string;
		userId: string;
		date: Date | string;
		dayStartTime: Date | null;
		dayEndTime: Date | null;
		extendedApprovedStartTime: Date | null;
		extendedApprovedEndTime: Date | null;
	} | null;

	// Start-time comparison
	loggedStartTime: Date | string | null;
	rosterStartTime: Date | string | null;

	// End-time comparison
	loggedEndTime: Date | string | null;
	rosterEndTime: Date | string | null;
}

export type ILateEmployeesAPIResponse = ILateEmployeeResponse[];

export interface IEmployeeWithTodayEntry {
	id: string;

	user: {
		id: string;
		name: string;
	} | null;

	hasTodayDayTimeEntry: boolean;

	employeeDayTime: Omit<IEmployeeDayTime, "employeePauseTime"> | null;

	roster: Pick<
		IRoster,
		"id" | "userId" | "date" | "dayStartTime" | "dayEndTime" | "extendedApprovedStartTime" | "extendedApprovedEndTime"
	> | null;
}

export type IEmployeeWithTodayEntryResponse = IEmployeeWithTodayEntry[];

export interface ICreateLateEntryPayload {
	employeeId: string;
	dayStartTime: string;
	date: string;
	lateAdminNote?: string;
}

export interface ICreateEarlyReleaseEntryPayload {
	employeeId: string;
	dayEndTime: string;
	date: string;
	earlyOutAdminNote?: string;
}

export enum LATENESS_FILTER_TAB {
	UNHANDLED = "UNHANDLED",
	ALL = "ALL",
	HANDLED = "HANDLED",
}
