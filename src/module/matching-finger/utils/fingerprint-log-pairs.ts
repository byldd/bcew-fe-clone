import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { IFingerprintLogEntry } from "@/module/matching-finger/types";

export interface IFingerprintLogPair {
	id: string;
	startLogId: string;
	endLogId: string;
	startTime: string;
	endTime: string;
	label: string;
}

export const getUsedLogIds = (
	stops: { assignmentId: string; startLogId?: string | null; endLogId?: string | null }[],
	excludeAssignmentId: string
): Set<string> => {
	const used = new Set<string>();
	stops.forEach((stop) => {
		if (stop.assignmentId === excludeAssignmentId) return;
		if (stop.startLogId) used.add(stop.startLogId);
		if (stop.endLogId) used.add(stop.endLogId);
	});
	return used;
};

export const buildConsecutivePairs = (logs: IFingerprintLogEntry[], usedLogIds: Set<string>): IFingerprintLogPair[] => {
	const availableLogs = logs
		.filter((log) => !usedLogIds.has(log.id))
		.sort((a, b) => new Date(a.scanTime).getTime() - new Date(b.scanTime).getTime());

	const pairs: IFingerprintLogPair[] = [];

	for (let i = 0; i < availableLogs.length - 1; i++) {
		const start = availableLogs[i];
		const end = availableLogs[i + 1];
		if (!start || !end) continue;

		pairs.push({
			id: `${start.id}_${end.id}`,
			startLogId: start.id,
			endLogId: end.id,
			startTime: start.scanTime,
			endTime: end.scanTime,
			label: `${toFormattedDate(start.scanTime, DATE_FORMAT.HH_MM_AA_PM)} to ${toFormattedDate(end.scanTime, DATE_FORMAT.HH_MM_AA_PM)}`,
		});
	}

	return pairs;
};
