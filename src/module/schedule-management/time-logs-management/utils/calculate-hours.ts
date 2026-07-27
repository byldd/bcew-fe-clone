import {
	dateToUTCString,
	deductMinutesFromDate,
	getDifferenceInHours,
	getDifferenceInMinutes,
	isInTimerange,
	minutesToHours,
	roundToNearest15Minutes,
	setTime,
	toDate,
} from "@/lib/utils/date";
import { ITimeLogResponse } from "../types";
import { LUNCH_BREAK_MINUTES } from "@/utils/constants";
import { IEmployeePauseTime } from "../../weekly-schedule-management/types/schedule-interface";

export const calculateDayHours = ({
	employeeDayTime,
	stops = [],
	pauses = [],
}: {
	employeeDayTime:
		| Pick<
				ITimeLogResponse["employeeDayTimes"],
				"dayStartTime" | "dayEndTime" | "overrideStartTime" | "overrideEndTime"
		  >
		| undefined;
	stops: Pick<
		ITimeLogResponse["jobs"][number],
		"startTime" | "endTime" | "overrideStartTime" | "overrideEndTime" | "jobnme"
	>[];
	pauses: Pick<IEmployeePauseTime, "pauseStartTime" | "pauseEndTime">[];
}) => {
	const { totalPuaseMinutes } = calculatePause({
		stops,
		pauses,
	});

	const dayStartTime = employeeDayTime?.overrideStartTime || employeeDayTime?.dayStartTime;
	const dayEndTime = employeeDayTime?.overrideEndTime || employeeDayTime?.dayEndTime;

	if (!dayStartTime || !dayEndTime) {
		return {
			hours: "--",
			timeString: "--",
		};
	}

	let startTime = toDate(dayStartTime);

	let endTime = toDate(dayEndTime);

	if (isBetween12And1230(startTime)) {
		startTime = setTime(startTime, "12:00");
	}

	if (isBetween12And1230(endTime)) {
		endTime = setTime(endTime, "12:30");
	}

	const range = { start: startTime, end: endTime };
	const timeToCheck = {
		start: setTime(toDate(dateToUTCString(startTime)), "12:00"),
		end: setTime(toDate(dateToUTCString(endTime)), "12:30"),
	};

	if (
		isInTimerange({
			range,
			timeToCheck,
		})
	) {
		endTime = deductMinutesFromDate(endTime, LUNCH_BREAK_MINUTES);
	}

	if (totalPuaseMinutes > 0) {
		endTime = deductMinutesFromDate(endTime, totalPuaseMinutes);
	}

	const stopStartTimeAdjusted = roundToNearest15Minutes(startTime);
	const stopEndTimeAdjustedRounded = roundToNearest15Minutes(endTime);

	const differenceInHours = getDifferenceInHours(stopStartTimeAdjusted, stopEndTimeAdjustedRounded);
	const differenceInMenutes = getDifferenceInMinutes(stopStartTimeAdjusted, stopEndTimeAdjustedRounded);
	const minutesToHoursString = minutesToHours(differenceInMenutes);

	return {
		hours: differenceInHours,
		timeString: minutesToHoursString,
	};
};

const isBetween12And1230 = (date: Date) => {
	const hours = date.getHours();
	const minutes = date.getMinutes();

	// 12:00 PM to 12:30 PM inclusive
	return hours === 12 && minutes >= 0 && minutes <= 30;
};

export const calculateStopHours = ({
	stop,
	employeePauseTime = [],
}: {
	stop: Pick<ITimeLogResponse["jobs"][number], "startTime" | "endTime" | "overrideStartTime" | "overrideEndTime">;
	employeePauseTime?: Pick<IEmployeePauseTime, "pauseStartTime" | "pauseEndTime">[];
}) => {
	const startTime = stop?.overrideStartTime || stop.startTime;
	const endTime = stop?.overrideEndTime || stop.endTime;

	if (!startTime || !endTime) {
		return "-";
	}

	let stopStartTime = toDate(startTime);

	let stopEndTime = toDate(endTime);

	if (isBetween12And1230(stopStartTime)) {
		stopStartTime = setTime(stopStartTime, "12:00");
	}

	if (isBetween12And1230(stopEndTime)) {
		stopEndTime = setTime(stopEndTime, "12:30");
	}

	const range = { start: stopStartTime, end: stopEndTime };
	const timeToCheck = {
		start: setTime(toDate(dateToUTCString(stopStartTime)), "12:00"),
		end: setTime(toDate(dateToUTCString(stopEndTime)), "12:30"),
	};

	if (
		isInTimerange({
			range,
			timeToCheck,
		})
	) {
		stopEndTime = deductMinutesFromDate(stopEndTime, LUNCH_BREAK_MINUTES);
	}

	const pauseTimes = employeePauseTime?.filter((pause) => {
		return (
			pause.pauseStartTime &&
			pause.pauseEndTime &&
			isInTimerange({
				range: { start: toDate(stopStartTime!), end: toDate(stopEndTime!) },
				timeToCheck: { start: toDate(pause.pauseStartTime!), end: toDate(pause.pauseEndTime!) },
			})
		);
	});

	const totalPauseMinutes =
		pauseTimes?.reduce((acc, curr) => acc + getDifferenceInMinutes(curr?.pauseStartTime, curr?.pauseEndTime), 0) || 0;

	if (totalPauseMinutes > 0) {
		stopEndTime = deductMinutesFromDate(stopEndTime, totalPauseMinutes);
	}

	const stopStartTimeAdjusted = roundToNearest15Minutes(stopStartTime);
	const stopEndTimeAdjustedRounded = roundToNearest15Minutes(stopEndTime);

	const differenceInHours = getDifferenceInHours(stopStartTimeAdjusted, stopEndTimeAdjustedRounded);

	return differenceInHours;
};

export const calculatePause = ({
	stops = [],
	pauses = [],
}: {
	stops: Pick<
		ITimeLogResponse["jobs"][number],
		"startTime" | "endTime" | "overrideStartTime" | "overrideEndTime" | "jobnme" | "specialJob"
	>[];
	pauses: Pick<IEmployeePauseTime, "pauseStartTime" | "pauseEndTime">[];
}) => {
	const gapBeetweenStops = [];
	let totalPuaseMinutes = 0;

	const filterStops = stops
		?.filter((stop) => {
			return (stop?.endTime && stop?.startTime) || (stop?.overrideEndTime && stop?.overrideStartTime);
		})
		.sort((a, b) => {
			const aStartTime = a?.overrideStartTime || a.startTime;
			const bStartTime = b?.overrideStartTime || b.startTime;
			return toDate(aStartTime!).getTime() - toDate(bStartTime!).getTime();
		});

	for (let i = 0; i < filterStops.length - 1; i++) {
		const currentStop = filterStops[i];
		const nextStop = filterStops[i + 1];

		const currentStopEndTime = currentStop?.overrideEndTime || currentStop?.endTime;
		const nextStopStartTime = nextStop?.overrideStartTime || nextStop?.startTime;

		if (!currentStopEndTime || !nextStopStartTime) {
			continue;
		}

		let gapInMinutes = getDifferenceInMinutes(currentStopEndTime, nextStopStartTime);

		let gapStartTime = toDate(currentStopEndTime);
		let gapEndTime = toDate(nextStopStartTime);

		if (isBetween12And1230(gapStartTime)) {
			gapStartTime = setTime(gapStartTime, "12:00");
		}

		if (isBetween12And1230(gapEndTime)) {
			gapEndTime = setTime(gapEndTime, "12:30");
		}

		const gapRange = { start: gapStartTime, end: gapEndTime };
		const gapTimeToCheck = {
			start: setTime(toDate(dateToUTCString(gapStartTime)), "12:00"),
			end: setTime(toDate(dateToUTCString(gapEndTime)), "12:30"),
		};

		// The day-level lunch deduction (calculateDayHours) already removes the 12:00-12:30 lunch
		// break once for the whole day, so it must not also be counted as a gap-between-stops pause.
		if (isInTimerange({ range: gapRange, timeToCheck: gapTimeToCheck })) {
			gapInMinutes -= LUNCH_BREAK_MINUTES;
		}

		if (gapInMinutes > 0) {
			totalPuaseMinutes += gapInMinutes;
			gapBeetweenStops.push({
				jobNames: `${currentStop?.jobnme || currentStop?.specialJob?.name} - ${nextStop?.jobnme || nextStop?.specialJob?.name}`,
				gap: minutesToHours(gapInMinutes),
			});
		}
	}

	for (const pause of pauses) {
		const pauseStartTime = pause?.pauseStartTime;
		const pauseEndTime = pause?.pauseEndTime;

		if (!pauseStartTime || !pauseEndTime) {
			continue;
		}

		const differenceInMinutes = getDifferenceInMinutes(pauseStartTime, pauseEndTime);

		if (differenceInMinutes > 0) {
			totalPuaseMinutes += differenceInMinutes;
		}
	}

	return {
		totalPuaseMinutes: totalPuaseMinutes,
		gapBeetweenStops,
		toatPauseTaken: minutesToHours(totalPuaseMinutes),
	};
};
