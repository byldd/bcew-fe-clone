import { ITimeLogResponse } from "@/module/schedule-management/time-logs-management/types";
import {
	calculateStopHours,
	calculatePause,
} from "@/module/schedule-management/time-logs-management/utils/calculate-hours";
import { calculateDayStartEndTimes } from "@/module/schedule-management/time-logs-management/utils";
import { JOB_PHASE_LABEL, SCHEDULE_ROW_TYPE_LABEL } from "../../weekly-schedule-management/constants/week-schedule";
import { QC_JOB_TYPE } from "../../weekly-schedule-management/types/schedule-interface";
import { JobWorkType } from "@/module/job/utils/enums";
import { formatPascalCase } from "@/lib/utils/value-formatter";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { getDayActualHours, getDayScheduledHours } from "../utils";
import { SectionTableHead, SectionTableCell } from "./table-components";

const DailySummaryTable = ({ timeLogs }: { timeLogs: ITimeLogResponse[] }) => (
	<table className="w-full min-w-max border-collapse">
		<thead>
			<tr className="bg-brand-bgLightgrey">
				<SectionTableHead>Date</SectionTableHead>
				<SectionTableHead>Day Start & End Time</SectionTableHead>
				<SectionTableHead>No. of Stops</SectionTableHead>
				<SectionTableHead>Scheduled Hours</SectionTableHead>
				<SectionTableHead>Actual Hours</SectionTableHead>
				<SectionTableHead>Unpaid Pause Time</SectionTableHead>
			</tr>
		</thead>
		<tbody>
			{timeLogs.map((timeLog) => {
				const { empDayStartTime, empDayEndTime } = calculateDayStartEndTimes(timeLog.employeeDayTimes, timeLog.jobs);
				const { toatPauseTaken, gapBeetweenStops } = calculatePause({
					stops: timeLog.jobs,
					pauses: timeLog.employeeDayTimes?.employeePauseTime,
				});
				const employeePauseTime = timeLog.employeeDayTimes?.employeePauseTime ?? [];

				return (
					<tr key={String(timeLog.date)}>
						<SectionTableCell>{toFormattedDate(timeLog.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}</SectionTableCell>
						<SectionTableCell>
							{empDayStartTime
								? `${toFormattedDate(empDayStartTime, DATE_FORMAT.HH_MM_AA_PM)} - ${empDayEndTime ? toFormattedDate(empDayEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}`
								: "-"}
						</SectionTableCell>
						<SectionTableCell>{timeLog.jobs?.length || "-"}</SectionTableCell>
						<SectionTableCell>{getDayScheduledHours(timeLog)} hrs</SectionTableCell>
						<SectionTableCell>{getDayActualHours(timeLog)} hrs</SectionTableCell>
						<SectionTableCell>
							{toatPauseTaken && toatPauseTaken !== "0 min" ? (
								<>
									<span className="block">{toatPauseTaken}</span>
									{gapBeetweenStops.map((gap, index) => (
										<span key={index} className="block text-brand-dark50">
											{gap.jobNames}: {gap.gap}
										</span>
									))}
									{employeePauseTime.map((pause, index) => (
										<span key={index} className="block text-brand-dark50">
											Pause {index + 1}: {toFormattedDate(pause.pauseStartTime, DATE_FORMAT.HH_MM_AA_PM)} -{" "}
											{toFormattedDate(pause.pauseEndTime, DATE_FORMAT.HH_MM_AA_PM)}
										</span>
									))}
								</>
							) : (
								"-"
							)}
						</SectionTableCell>
					</tr>
				);
			})}
		</tbody>
	</table>
);

const StopsTable = ({ timeLogs }: { timeLogs: ITimeLogResponse[] }) => {
	const rows = timeLogs.flatMap((timeLog) =>
		[...timeLog.jobs]
			.sort((a, b) => (a.stopNumber || Number.MAX_SAFE_INTEGER) - (b.stopNumber || Number.MAX_SAFE_INTEGER))
			.map((stop) => ({ stop, timeLog }))
	);

	if (rows.length === 0) {
		return <p className="px-1 py-2 text-xs text-brand-dark50">No stops logged</p>;
	}

	return (
		<table className="w-full min-w-max border-collapse">
			<thead>
				<tr className="bg-brand-bgLightgrey">
					<SectionTableHead>Date</SectionTableHead>
					<SectionTableHead>Stop No.</SectionTableHead>
					<SectionTableHead>Job Name</SectionTableHead>
					<SectionTableHead>Phase</SectionTableHead>
					<SectionTableHead>Logged Start Time</SectionTableHead>
					<SectionTableHead>Logged End Time</SectionTableHead>
					<SectionTableHead>Override Start & End Time</SectionTableHead>
					<SectionTableHead>Hours</SectionTableHead>
					<SectionTableHead>Notes</SectionTableHead>
				</tr>
			</thead>
			<tbody>
				{rows.map(({ stop, timeLog }, index) => (
					<StopRow key={stop.id ?? index} stop={stop} timeLog={timeLog} />
				))}
			</tbody>
		</table>
	);
};

const StopRow = ({ stop, timeLog }: { stop: ITimeLogResponse["jobs"][number]; timeLog: ITimeLogResponse }) => {
	const {
		stopNumber,
		jobnme,
		tsknme,
		startTime,
		endTime,
		overrideStartTime,
		overrideEndTime,
		overrideReason,
		overTimeReason,
		dailyJobNotes,
		specialJob,
		tsknum,
		isQcJob,
		ordnum,
		qcType,
		didNotWorked,
	} = stop;

	const qcJobType = qcType
		? `${qcType === QC_JOB_TYPE.REPAIR ? SCHEDULE_ROW_TYPE_LABEL.QC_REPAIR : SCHEDULE_ROW_TYPE_LABEL.QC_INSPECTION}`
		: null;

	const stopHours = calculateStopHours({ stop, employeePauseTime: timeLog.employeeDayTimes?.employeePauseTime });
	const jobName = specialJob?.name ?? jobnme;

	const notes = [
		overrideReason && `Override Reason: ${overrideReason}`,
		overTimeReason && `Overtime Reason: ${overTimeReason}`,
		...(dailyJobNotes ?? []).map((note) => note.note),
	].filter(Boolean);

	return (
		<tr>
			<SectionTableCell>{toFormattedDate(timeLog.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}</SectionTableCell>
			<SectionTableCell>{stopNumber ?? "-"}</SectionTableCell>
			<SectionTableCell>{jobName ? formatPascalCase(jobName) : "-"}</SectionTableCell>
			<SectionTableCell>
				{isQcJob ? JOB_PHASE_LABEL[Number(tsknum)] : tsknme || ordnum || "--"}
				{qcJobType ? ` (${qcJobType})` : ""}
			</SectionTableCell>
			<SectionTableCell>
				{didNotWorked
					? JobWorkType.DID_NOT_WORKED
					: startTime
						? toFormattedDate(startTime, DATE_FORMAT.HH_MM_AA_PM)
						: "--"}
			</SectionTableCell>
			<SectionTableCell>
				{didNotWorked ? JobWorkType.DID_NOT_WORKED : endTime ? toFormattedDate(endTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
			</SectionTableCell>
			<SectionTableCell>
				{overrideStartTime || overrideEndTime ? (
					<>
						{overrideStartTime ? toFormattedDate(overrideStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"} -{" "}
						{overrideEndTime ? toFormattedDate(overrideEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
					</>
				) : (
					"--"
				)}
			</SectionTableCell>
			<SectionTableCell>{stopHours}</SectionTableCell>
			<SectionTableCell>
				{notes.length > 0
					? notes.map((note, index) => (
							<span key={index} className="block">
								{note}
							</span>
						))
					: "-"}
			</SectionTableCell>
		</tr>
	);
};

const TimeLogsSectionTable = ({ timeLogs }: { timeLogs: ITimeLogResponse[] }) => {
	if (timeLogs.length === 0) {
		return <p className="px-1 py-2 text-xs text-brand-dark50">No time logs</p>;
	}

	const sortedTimeLogs = [...timeLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	return (
		<div className="flex flex-col gap-3">
			<div className="overflow-x-auto rounded-lg border">
				<DailySummaryTable timeLogs={sortedTimeLogs} />
			</div>
			<div className="overflow-x-auto rounded-lg border">
				<StopsTable timeLogs={sortedTimeLogs} />
			</div>
		</div>
	);
};

export default TimeLogsSectionTable;
