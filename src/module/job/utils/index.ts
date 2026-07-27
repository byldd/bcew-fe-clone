import { openErrorToast } from "@/components/toast";
import { dateToUTCString, getTimeString, isSameDate, toDate, toFormattedDate } from "@/lib/utils/date";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import {
	IJobEmployeeAssignment,
	IJobLabelAssignments,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { extendedTimeType } from "./enums";
import { IExtendedTime, IJobUpdateFormProps } from "../types";
import { IEmployeeScheduleItem, IStopOptions } from "@/module/employee-dashboard/types";
import { FieldErrors } from "react-hook-form";
import { IJobUpdateFormSchema } from "../components/job-update-modal/job-update-form";

export function extractUTCDayAndTime(dateString?: string | Date): string {
	if (!dateString) return "";

	const date = new Date(dateString);
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${hours}:${minutes}`;
}

export const formatOvertime = (hours: number | null | undefined, minutes: number | null | undefined) => {
	if (!hours && !minutes) return "No overtime requested";

	let timeString = "";
	if (hours && hours > 0) {
		timeString += `${hours} hour${hours > 1 ? "s" : ""}`;
	}
	if (minutes && minutes > 0) {
		if (timeString) timeString += " ";
		timeString += `${minutes} min${minutes > 1 ? "s" : ""}`;
	}
	return timeString || "0 mins";
};

export const isJobNewStart = (
	jobLabelAssignments: IJobLabelAssignments[] | undefined,
	isReady: boolean | undefined
) => {
	let jobNewStart = false;
	if (!isReady && jobLabelAssignments) {
		jobNewStart =
			!jobLabelAssignments.some((label) => label.labelId === legends.jobNotReady) &&
			jobLabelAssignments.some((label) => label.labelId === legends.newStart || label.labelId === legends.warrantyJob);
	}
	return jobNewStart;
};

export const handlePastFutureDateOperations = (
	jobDate: Date | string | undefined,
	currentDate: Date | string | undefined,
	dayEndTime?: Date | string | undefined,
	allowPastWithoutStartTime = false,
	showToast = false
) => {
	if (!jobDate || !currentDate) return false;

	const normalizeDate = (date: Date | string) => {
		const normalizedDate = new Date(toDate(date));
		normalizedDate.setHours(0, 0, 0, 0);
		return normalizedDate;
	};

	const job = normalizeDate(jobDate);
	const current = normalizeDate(currentDate);

	//if current date then allow editing
	if (job.getTime() === current.getTime()) {
		return false;
	}

	//if future date then disable editing
	if (job > current) {
		if (showToast) {
			openErrorToast({ message: "Editing future dates is not allowed" });
		}
		return true;
	}

	//if past date and stop time is not logged, then allow editing.
	if (allowPastWithoutStartTime) {
		return false;
	}

	//if past date and day not ended, then allow editing.
	if (!dayEndTime) {
		return false;
	}

	if (showToast) {
		openErrorToast({ message: "Editing past dates is not allowed" });
	}
	return true;
};

export const handleSubContractorPastFutureDateOperations = (
	jobDate: Date | string | undefined,
	currentDate: Date | string | undefined
) => {
	if (!jobDate || !currentDate) return false;

	const job = toFormattedDate(jobDate);
	const current = toFormattedDate(currentDate);

	return job > current;
};

export const isBoolean = (value: unknown): value is boolean => {
	return typeof value === "boolean";
};

export const verifyExtendedTimePayload = (
	extendedStartTime: Date,
	extendedEndTime: Date,
	rosterStartTime: Date,
	rosterEndTime: Date,
	extendedType: string
) => {
	if (!rosterStartTime || !rosterEndTime) {
		openErrorToast({ message: "Roster times are missing" });
		return false;
	}

	const isStartValid = extendedStartTime < rosterStartTime;
	const isEndValid = extendedEndTime > rosterEndTime;

	if ((extendedType === extendedTimeType.EARLY_START || extendedType === extendedTimeType.BOTH) && !isStartValid) {
		openErrorToast({ message: "Early start time must be before roster start time" });
		return false;
	}
	if ((extendedType === extendedTimeType.LATE_RELEASE || extendedType === extendedTimeType.BOTH) && !isEndValid) {
		openErrorToast({ message: "Request Time must be after roster end time" });
		return false;
	}

	return true;
};

export const calculateExtendedHours = (
	selectedDate: Date | string | undefined,
	rosterDate: Date | string | undefined,
	type: string
): string => {
	if (!selectedDate || !rosterDate) return "0 hr 0 min";

	const selectedTime = getTimeString(selectedDate);
	const rosterTimeStr = getTimeString(rosterDate);

	const [rosterHours = 0, rosterMinutes = 0] = rosterTimeStr.split(":").map(Number);
	const [selectedHours = 0, selectedMinutes = 0] = selectedTime.split(":").map(Number);

	const rosterTotalMinutes = rosterHours * 60 + rosterMinutes;
	const selectedTotalMinutes = selectedHours * 60 + selectedMinutes;

	const diffMinutes =
		type === extendedTimeType.EARLY_START
			? Math.max(rosterTotalMinutes - selectedTotalMinutes, 0)
			: Math.max(selectedTotalMinutes - rosterTotalMinutes, 0);

	const hours = Math.floor(diffMinutes / 60);
	const minutes = diffMinutes % 60;

	return `${hours} hr ${minutes} min`;
};

export const formatCompletionTime = (hoursDecimal: number | null | undefined): string => {
	if (!hoursDecimal) return "0 hr";
	const hours = Math.floor(hoursDecimal);
	const minutes = Math.round((hoursDecimal - hours) * 60);

	const hourPart = hours > 0 ? `${hours} hr${hours !== 1 ? "s" : ""}` : "";
	const minutePart = minutes > 0 ? `${minutes} min${minutes !== 1 ? "s" : ""}` : "";

	if (!hourPart && !minutePart) return "0 hr";

	return [hourPart, minutePart].filter(Boolean).join(" ");
};

export const hasPendingBothTypeRequest = (extendedRequests: IExtendedTime[], id: string | null) => {
	const hasBoth = extendedRequests.some(
		(request) => request.extendedType === extendedTimeType.BOTH && !isBoolean(request.isApproved)
	);
	return (
		hasBoth || (hasPendingEarlyTypeRequest(extendedRequests, id) && hasPendingLateTypeRequest(extendedRequests, id))
	);
};

export const hasPendingEarlyTypeRequest = (extendedRequests: IExtendedTime[], id: string | null) => {
	return extendedRequests.some(
		(request) =>
			request.extendedType === extendedTimeType.EARLY_START && !isBoolean(request.isApproved) && request.id != id
	);
};

export const hasPendingLateTypeRequest = (extendedRequests: IExtendedTime[], id: string | null) => {
	return extendedRequests.some(
		(request) =>
			request.extendedType === extendedTimeType.LATE_RELEASE && !isBoolean(request.isApproved) && request.id != id
	);
};

export const getAllowedExtendedType = (extendedRequests: IExtendedTime[], id: string | null) => {
	const hasPendingEarly = hasPendingEarlyTypeRequest(extendedRequests, id);
	const hasPendingLate = hasPendingLateTypeRequest(extendedRequests, id);

	if (hasPendingEarly) return extendedTimeType.LATE_RELEASE;

	if (hasPendingLate) return extendedTimeType.EARLY_START;

	return null;
};

export const validateExtendedTypeSelection = (
	extendedType: extendedTimeType,
	extendedRequests: IExtendedTime[],
	id: string | null
): boolean => {
	const allowedType = getAllowedExtendedType(extendedRequests, id);

	if (allowedType && extendedType !== allowedType) {
		openErrorToast({
			message: `You already have a pending ${
				allowedType === extendedTimeType.EARLY_START ? "Late Release" : "Early Start"
			} request. You can only send a ${
				allowedType === extendedTimeType.EARLY_START ? "Early Start" : "Late Release"
			} request.`,
		});
		return false;
	}

	return true;
};

export const getMaxStartTime = (
	jobAssignments: Pick<IJobEmployeeAssignment, "endTime">[],
	roster: {
		dayStartTime: string;
		dayEndTime: string;
		extendedApprovedStartTime?: string | undefined;
		extendedApprovedEndTime?: string | undefined;
	}
): Date => {
	const times: Date[] = [];

	if (roster?.extendedApprovedStartTime) {
		times.push(toDate(roster.extendedApprovedStartTime));
	} else if (roster?.dayStartTime) {
		times.push(toDate(roster.dayStartTime));
	}

	jobAssignments.forEach((j) => {
		if (j.endTime) {
			times.push(toDate(j.endTime));
		}
	});

	return times.length ? toDate(new Date(Math.max(...times.map((t) => t.getTime())))) : toDate(new Date());
};

export const getMinEndTime = (
	jobAssignments: Pick<IJobEmployeeAssignment, "startTime">[],
	roster: {
		dayStartTime: string;
		dayEndTime: string;
		extendedApprovedStartTime?: string | undefined;
		extendedApprovedEndTime?: string | undefined;
	}
): Date => {
	const times: Date[] = [];

	if (roster?.extendedApprovedEndTime) {
		times.push(toDate(roster.extendedApprovedEndTime));
	} else if (roster?.dayEndTime) {
		times.push(toDate(roster.dayEndTime));
	}

	jobAssignments.forEach((j) => {
		if (j.startTime) {
			times.push(toDate(j.startTime));
		}
	});

	return times.length ? toDate(new Date(Math.max(...times.map((t) => t.getTime())))) : toDate(new Date());
};

export const getLowestStartTime = (data: IEmployeeScheduleItem[] | undefined, fallback: string): string => {
	if (!data || data.length === 0) return fallback;

	const validStartTimes = data.filter((t) => t.startTime).map((j) => toDate(j.startTime!).getTime());

	if (validStartTimes.length === 0) return fallback;

	return dateToUTCString(new Date(Math.min(...validStartTimes)));
};

export const getHighestEndTime = (data: IEmployeeScheduleItem[] | undefined, fallback: string): string => {
	if (!data || data.length === 0) return fallback;

	const validEndTimes = data.filter((t) => t.endTime).map((j) => toDate(j.endTime!).getTime());

	if (validEndTimes.length === 0) return fallback;

	return dateToUTCString(new Date(Math.max(...validEndTimes)));
};

export const getWorkOnScheduleOptions = (
	extendedType: extendedTimeType,
	schedules: IEmployeeScheduleItem[] | undefined,
	stopOptions: IStopOptions[]
) => {
	if (!schedules || !extendedType) {
		return stopOptions;
	}

	const checkAllStopsLogged = () => {
		return schedules.every((schedule) => schedule.didNotWorked || (schedule.startTime && schedule.endTime));
	};

	if (!checkAllStopsLogged()) {
		return stopOptions;
	}

	const validSchedules = schedules.filter(
		(
			sch
		): sch is IEmployeeScheduleItem & {
			startTime: string;
			endTime: string;
		} => !sch.didNotWorked && typeof sch.startTime === "string" && typeof sch.endTime === "string"
	);

	if (!validSchedules.length) {
		return stopOptions;
	}

	if (extendedType === extendedTimeType.EARLY_START) {
		const firstStop = validSchedules.reduce((min, current) =>
			new Date(current.startTime).getTime() < new Date(min.startTime).getTime() ? current : min
		);

		return stopOptions.filter((option) => option.value === firstStop.jobDailyRecord.id);
	} else {
		const lastStop = validSchedules.reduce((max, current) =>
			new Date(current.endTime).getTime() > new Date(max.endTime).getTime() ? current : max
		);

		return stopOptions.filter((option) => option.value === lastStop.jobDailyRecord.id);
	}
};

export const getInitialCrew = (job: IJobUpdateFormProps["job"]) => {
	const { forecastCrews, jobEmployeeAssignments } = job;
	if (forecastCrews && forecastCrews.length > 0) {
		return forecastCrews.map((fcrew) => ({
			employeeId: fcrew.employeeId || "",
			name:
				fcrew?.employee?.user?.name ||
				jobEmployeeAssignments?.find((a) => a.employeeId === fcrew.employeeId)?.name ||
				"--",
			checked: true,
			forecastHours: fcrew.forecastHours || 0,
		}));
	}
	return (
		jobEmployeeAssignments?.map((assignment) => ({
			employeeId: assignment.employeeId || "",
			name: assignment.name || assignment.employee?.user?.name || "--",
			checked: true,
			forecastHours: assignment.forecastHours || 0,
		})) || []
	);
};

type IGetBannerParams = {
	forecastDate?: Date | string | null;
	jobEndDate: Date;
	today: Date;
	errors?: FieldErrors<IJobUpdateFormSchema>;
	isScheduledOnlyTillToday: boolean;
	forecastCompletion: boolean | null | undefined;
};

export const getForecastBanner = ({
	forecastDate,
	jobEndDate,
	today,
	errors,
	isScheduledOnlyTillToday,
	forecastCompletion,
}: IGetBannerParams): {
	message: string | undefined;
	color: string;
} | null => {
	const hasForecast = !!forecastDate;

	const forecastTime = hasForecast ? toDate(forecastDate).getTime() : null;

	const jobEndTime = jobEndDate.getTime();

	const isBeyondSchedule = hasForecast && forecastTime! > jobEndTime;
	const isWithinSchedule = hasForecast && forecastTime! <= jobEndTime;
	const isDifferentFromToday = hasForecast && !isSameDate(forecastDate, today);

	if (errors?.forecastDate) {
		return {
			message: errors?.forecastDate?.message,
			color: "text-red-500",
		};
	}

	if (isScheduledOnlyTillToday && forecastCompletion) {
		return {
			message: "This job was originally planned to end today. You’re extending it to tomorrow.",
			color: "text-orange-500",
		};
	}

	if (isBeyondSchedule || (isScheduledOnlyTillToday && isDifferentFromToday)) {
		return {
			message: `This job was originally planned to end on ${toFormattedDate(
				jobEndDate
			)}. You’re extending it to ${toFormattedDate(forecastDate)}.`,
			color: "text-orange-500",
		};
	}

	if (isWithinSchedule) {
		return {
			message: `This job is scheduled till ${toFormattedDate(
				jobEndDate
			)}. Your forecasted completion fits within the planned schedule.`,
			color: "text-gray-500",
		};
	}

	return null;
};
