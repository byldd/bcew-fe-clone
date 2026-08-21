import { ILegacyBreakdownDetail, IRawLegacyBreakdownDetail } from "../types";

const trimOrNull = (value: string | null): string | null => (value?.trim() ? value.trim() : null);

export const mapLegacyBreakdownDetail = (raw: IRawLegacyBreakdownDetail): ILegacyBreakdownDetail => ({
	id: raw.id,
	recordNumber: raw.id,
	truckNumber: trimOrNull(raw.eqpmnt_recnum),
	employeeName: trimOrNull(raw.employeeName),
	issue: trimOrNull(raw.issue),
	description: trimOrNull(raw.request),
	notes: trimOrNull(raw.Notes),
	date: raw.date,
});
