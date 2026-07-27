import { ColumnDef, CellContext } from "@tanstack/react-table";
import { extractUTCDayAndTime } from "@/module/schedule-management/time-logs-management/utils";
import { IWeekRoster } from "@/module/employee/types";
import {
	formatHoursToHM,
	getTimeSourceLabel,
	isDayTimeDifferent,
	isDayTimeSame,
} from "@/module/schedule-management/roster-time-configuration/utils";
import { IEmployeeDayTime } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { WEEK_DAY } from "@/utils/enums";
import { calculateEffectiveHours, getTotalPauseHours } from ".";
import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import { TIME_SOURCE_DISPLAY_MAP } from "@/module/schedule-management/roster-time-configuration/constants";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

// helper: build day times
const getDayTimes = (row: IWeekRoster) => {
	const rosterDayTime = {
		dayStartTime: row?.dayStartTime || "",
		dayEndTime: row?.dayEndTime || "",
	};

	const employeeDayTime = {
		dayStartTime: row?.employeeDayTime?.overrideStartTime || row?.employeeDayTime?.dayStartTime || "",
		dayEndTime: row?.employeeDayTime?.overrideEndTime || row?.employeeDayTime?.dayEndTime || "",
	};

	return { rosterDayTime, employeeDayTime };
};

// helper: decide text class
const getTimeClass = (
	rosterDayTime: { dayStartTime: string; dayEndTime: string },
	employeeDayTime: IEmployeeDayTime
) => {
	return isDayTimeDifferent(rosterDayTime, employeeDayTime)
		? "text-red-500"
		: isDayTimeSame(rosterDayTime, employeeDayTime)
			? "text-green-500"
			: "text-gray-500";
};

export const useEmployeeRosterTimeConfigColumns = () => {
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const columns: ColumnDef<IWeekRoster>[] = [
		{
			accessorKey: "date",
			header: tPeople.day,
			cell: ({ row }: CellContext<IWeekRoster, unknown>) => {
				const dayName = toFormattedDate(row.original.date, DATE_FORMAT.FULL_WEEK_DAY);

				return (
					<div>
						<p>{dayName}</p>
						<p className="text-gray-500">{getTimeSourceLabel(row?.original?.timeSource)}</p>
					</div>
				);
			},
		},
		{
			accessorKey: "dayStartTime",
			header: tPeople.dayStartTime,
			cell: ({ row }) => {
				if (row.original?.isOnLeave) return "--";
				const dayName = toFormattedDate(row.original.date, DATE_FORMAT.FULL_WEEK_DAY);
				if (dayName === WEEK_DAY.Saturday && !row?.original?.isSaturdayWorking) return "--";
				if (dayName === WEEK_DAY.Sunday && !row?.original?.isSundayWorking) return "--";
				if (row?.original?.timeSource === TimeSource.NOT_WORKING) return "--";

				const { rosterDayTime } = getDayTimes(row.original);

				return (
					<p className={`text-sm ${getTimeClass(rosterDayTime, row?.original?.employeeDayTime)}`}>
						{extractUTCDayAndTime(rosterDayTime.dayStartTime) || "--"}
					</p>
				);
			},
		},
		{
			accessorKey: "dayEndTime",
			header: tPeople.dayEndTime,
			cell: ({ row }) => {
				if (row.original?.isOnLeave) return "--";
				const dayName = toFormattedDate(row.original.date, DATE_FORMAT.FULL_WEEK_DAY);
				if (dayName === WEEK_DAY.Saturday && !row?.original?.isSaturdayWorking) return "--";
				if (dayName === WEEK_DAY.Sunday && !row?.original?.isSundayWorking) return "--";
				if (row?.original?.timeSource === TimeSource.NOT_WORKING) return "--";

				const { rosterDayTime } = getDayTimes(row.original);

				return (
					<p className={`text-sm ${getTimeClass(rosterDayTime, row?.original?.employeeDayTime)}`}>
						{extractUTCDayAndTime(rosterDayTime.dayEndTime) || "--"}
					</p>
				);
			},
		},
		{
			accessorKey: "actualTime",
			header: tPeople.scheduleHours,
			cell: ({ row }) => {
				const { isOnLeave, date, isSaturdayWorking, isSundayWorking, timeSource } = row.original;

				if (isOnLeave) return <span className="text-md text-gray-500">PTO</span>;
				if (timeSource === TimeSource.NOT_WORKING) {
					return <span className="text-md text-gray-500">{TIME_SOURCE_DISPLAY_MAP[TimeSource.NOT_WORKING]}</span>;
				}

				const dayName = toFormattedDate(date, DATE_FORMAT.FULL_WEEK_DAY);
				if (dayName === WEEK_DAY.Saturday && !isSaturdayWorking) return "--";
				if (dayName === WEEK_DAY.Sunday && !isSundayWorking) return "--";

				const { rosterDayTime } = getDayTimes(row.original);
				const rosterHours = calculateEffectiveHours(rosterDayTime.dayStartTime, rosterDayTime.dayEndTime);

				return (
					<span className={`text-sm ${getTimeClass(rosterDayTime, row.original.employeeDayTime)}`}>
						{formatHoursToHM(rosterHours)}
					</span>
				);
			},
		},
		{
			accessorKey: "loggedTime",
			header: tPeople.loggedHours,
			cell: ({ row }) => {
				const { isOnLeave, timeSource } = row.original;
				if (isOnLeave) return <span className="text-md text-gray-500">PTO</span>;
				if (timeSource === TimeSource.NOT_WORKING) {
					return <span className="text-md text-gray-500">{TIME_SOURCE_DISPLAY_MAP[TimeSource.NOT_WORKING]}</span>;
				}

				const { rosterDayTime, employeeDayTime } = getDayTimes(row.original);

				const rosterHours = calculateEffectiveHours(rosterDayTime.dayStartTime, rosterDayTime.dayEndTime);
				let workingHour = calculateEffectiveHours(employeeDayTime.dayStartTime, employeeDayTime.dayEndTime);

				// Subtract pauses
				const pauses = row?.original?.employeeDayTime?.employeePauseTime || [];

				const totalPauseTime = getTotalPauseHours(pauses);
				workingHour -= totalPauseTime;

				const workingHourColor =
					!workingHour || isNaN(workingHour) || workingHour <= 0
						? ""
						: rosterHours === workingHour
							? "text-green-500"
							: "text-red-500";

				return <span className={`text-sm ${workingHourColor}`}>{formatHoursToHM(workingHour)}</span>;
			},
		},
	];
	return columns;
};
