import { IMyRecord } from "../types";

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
