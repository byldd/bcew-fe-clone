import { IEmployeeExtendedTime } from "@/module/job/types";
import { IMiddayStopRequest } from "@/module/schedule-management/time-requests/utils/types";
import { mapExtendedRequestsToRows } from "@/module/schedule-management/time-requests/utils";
import { extendedTimeType } from "@/module/job/utils/enums";
import { extendedReasonMap } from "@/module/job/utils/constants";
import { requestTypeLabel } from "@/module/midday-stops/utils/constants";
import { MIDDAY_STOP_REQUEST_TYPE } from "@/module/midday-stops/utils/enums";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

export type IUnifiedTimeRequestRow = {
	id: string;
	date: string;
	requestType: string;
	timeInfo: React.ReactNode;
	details: React.ReactNode;
	note: string;
	isApproved: boolean | null | undefined;
};

export const mapExtendedTimeRows = (extendedTimes: IEmployeeExtendedTime[]): IUnifiedTimeRequestRow[] => {
	const rows = mapExtendedRequestsToRows(extendedTimes) ?? [];

	return rows.map((row) => {
		const isEarlyStart = row.requestType === extendedTimeType.EARLY_START;
		const isLateRelease = row.requestType === extendedTimeType.LATE_RELEASE;

		return {
			id: row.id,
			date: row.date,
			requestType: isEarlyStart ? "Early Start" : isLateRelease ? "Late Release" : "Early Start & Late Release",
			timeInfo: isEarlyStart ? (
				<>
					<span className="text-brand-dark50">Early Start Time</span>{" "}
					{row.requestStart && toFormattedDate(row.requestStart, DATE_FORMAT.HH_MM_AA_PM)}
				</>
			) : isLateRelease ? (
				<>
					<span className="text-brand-dark50">Late Release Time</span>{" "}
					{row.requestEnd && toFormattedDate(row.requestEnd, DATE_FORMAT.HH_MM_AA_PM)}
				</>
			) : (
				<>
					<span className="text-brand-dark50">Early Start</span>{" "}
					{row.requestStart && toFormattedDate(row.requestStart, DATE_FORMAT.HH_MM_AA_PM)}
					{" / "}
					<span className="text-brand-dark50">Late Release</span>{" "}
					{row.requestEnd && toFormattedDate(row.requestEnd, DATE_FORMAT.HH_MM_AA_PM)}
				</>
			),
			details: (
				<>
					{extendedReasonMap[row.reason] ?? row.reason}
					{row.stopName && <span className="block text-brand-dark50">{row.stopName}</span>}
				</>
			),
			note: row.note ?? "-",
			isApproved: row.isApproved,
		};
	});
};

export const mapNewJobRequestRows = (newJobRequests: IMiddayStopRequest[]): IUnifiedTimeRequestRow[] =>
	newJobRequests.map((request) => ({
		id: request.id,
		date: request.date,
		requestType: requestTypeLabel[request.requestType] ?? "-",
		timeInfo: (
			<>
				{toFormattedDate(request.startTime, DATE_FORMAT.HH_MM_AA_PM)} -{" "}
				{toFormattedDate(request.endTime, DATE_FORMAT.HH_MM_AA_PM)}
			</>
		),
		details: request.project ? (
			<>
				{request.requestType === MIDDAY_STOP_REQUEST_TYPE.ADD_NEW_STOP
					? request.project
					: requestTypeLabel[request.requestType]}
				{request.actrec && <span className="block text-brand-dark50">Job #{request.actrec}</span>}
			</>
		) : (
			(requestTypeLabel[request.requestType] ?? "-")
		),
		note: request.note ?? "-",
		isApproved: request.isApproved,
	}));
