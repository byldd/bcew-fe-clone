import { IMyRecord } from "../types";

const recordDate = (record: IMyRecord) => new Date(record.submittedAt ?? record.createdAt);

const toDayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const filterMyRecordsByDateRange = (
	records: IMyRecord[],
	startDate: Date | null,
	endDate: Date | null
): IMyRecord[] => {
	if (!startDate || !endDate) return records;

	const start = toDayStart(startDate);
	const end = toDayStart(endDate);

	return records.filter((record) => {
		const day = toDayStart(recordDate(record));
		return day >= start && day <= end;
	});
};

export const filterMyRecordsByQuery = (records: IMyRecord[], search: string): IMyRecord[] => {
	const query = search.trim().toLowerCase();
	if (!query) return records;

	return records.filter(
		(record) =>
			(record.truckNumber ?? "").toLowerCase().includes(query) ||
			record.title.toLowerCase().includes(query) ||
			(record.reportNumber ?? "").toLowerCase().includes(query)
	);
};
