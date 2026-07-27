import { IEmployeeExtendedTime, IExtendedTime } from "@/module/job/types";
import { IMiddayStopRequest } from "./types";
import { fingerprintApprovalStatus, requestStatusTypes } from "./enums";

const mapExtendedRequestsToRows = (data: IEmployeeExtendedTime[] | undefined) => {
	return data?.flatMap((request) =>
		request.extendedRequestTimes.map((ext: IExtendedTime) => ({
			id: ext.id,
			employeeName: request.employee?.user?.name ?? "-",
			rosterStart: request.employee?.user?.rosterTimes?.[0]?.dayStartTime,
			rosterEnd: request.employee?.user?.rosterTimes?.[0]?.dayEndTime,
			requestType: ext.extendedType,
			requestStart: ext.startTime,
			requestEnd: ext.endTime,
			reason: ext.extendedReason,
			isApproved: ext.isApproved,
			note: ext.note,
			stopName: ext.stopName,
			date: request.date || "",
			userId: request.employee?.user?.rosterTimes?.[0]?.userId || "",
			extendedType: ext.extendedType,
			jobStartTime: ext.jobStartTime,
			jobEndTime: ext.jobEndTime,
			extendedReason: ext.extendedReason,
			extendedRosterStartTime: request.employee?.user?.rosterTimes?.[0]?.extendedApprovedStartTime,
			extendedRosterEndTime: request.employee?.user?.rosterTimes?.[0]?.extendedApprovedEndTime,
		}))
	);
};

const formatDuration = (start: string, end: string) => {
	const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
	const hours = Math.floor(diff / 60);
	const minutes = diff % 60;
	return `${hours} hr ${minutes} min`;
};

function applyMiddayStopFilters(
	data: IMiddayStopRequest[] | undefined,
	filters: {
		employeeName?: string;
		requestType?: string;
		requestStatus?: string;
		search: string;
	}
): IMiddayStopRequest[] {
	if (!data) return [];

	return data.filter((row) => {
		const name = row.employee?.user?.name?.toLowerCase() ?? "";
		const search = filters.search?.toLowerCase() ?? "";

		const matchesSearch = search ? name.includes(search) : true;

		const matchesEmployeeName = filters.employeeName ? name.includes(filters.employeeName.toLowerCase()) : true;

		const matchesRequestType = filters.requestType ? row.requestType === filters.requestType : true;

		const matchesRequestStatus = filters.requestStatus
			? (() => {
					if (filters.requestStatus === requestStatusTypes.APPROVED) return row.isApproved === true;
					if (filters.requestStatus === requestStatusTypes.REJECTED) return row.isApproved === false;
					if (filters.requestStatus === requestStatusTypes.PENDING) return row.isApproved === null;
					return true;
				})()
			: true;

		return matchesSearch && matchesEmployeeName && matchesRequestType && matchesRequestStatus;
	});
}

type ExtendedRow = NonNullable<ReturnType<typeof mapExtendedRequestsToRows>>[number];

function applyExtendedTimeFilters(
	data: ExtendedRow[] | undefined,
	filters: {
		employeeName?: string;
		requestType?: string;
		requestStatus?: string;
		search: string;
	}
) {
	if (!data) return [];

	return data.filter((row) => {
		const name = row.employeeName?.toLowerCase() ?? "";
		const search = filters.search?.toLowerCase() ?? "";

		const matchesSearch = search ? name.includes(search) : true;

		const matchesEmployeeName = filters.employeeName ? name.includes(filters.employeeName.toLowerCase()) : true;

		const matchesRequestType = filters.requestType ? row.extendedReason === filters.requestType : true;

		const matchesRequestStatus = filters.requestStatus
			? (() => {
					if (filters.requestStatus === requestStatusTypes.APPROVED) return row.isApproved === true;
					if (filters.requestStatus === requestStatusTypes.REJECTED) return row.isApproved === false;
					if (filters.requestStatus === requestStatusTypes.PENDING) return row.isApproved === null;
					return true;
				})()
			: true;

		return matchesSearch && matchesEmployeeName && matchesRequestType && matchesRequestStatus;
	});
}

function mapToFingerprintStatus(status: string | undefined): fingerprintApprovalStatus | undefined {
	if (!status) return undefined;
	const map: Record<string, fingerprintApprovalStatus> = {
		[requestStatusTypes.APPROVED]: fingerprintApprovalStatus.ACCEPTED,
		[requestStatusTypes.REJECTED]: fingerprintApprovalStatus.DECLINED,
		[requestStatusTypes.PENDING]: fingerprintApprovalStatus.PENDING,
	};
	return map[status];
}

export {
	mapExtendedRequestsToRows,
	formatDuration,
	applyMiddayStopFilters,
	applyExtendedTimeFilters,
	mapToFingerprintStatus,
};
