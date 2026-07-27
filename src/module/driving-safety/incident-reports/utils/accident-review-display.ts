import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

export const DASH = "--";

export const orDash = (value: string | null | undefined): string => value?.trim() || DASH;

export const yesNo = (value: boolean | null | undefined): string => {
	if (value === null || value === undefined) return DASH;
	return value ? "Yes" : "No";
};

export const money = (value: string | number | null | undefined): string =>
	value === null || value === undefined ? DASH : `$${Number(value).toFixed(2)}`;

export const dateTime = (value: string | null | undefined): string =>
	value ? toLocalFormattedDate(value, DATE_FORMAT.DATE_AND_TIME) : DASH;

export const fileNameFromKeyFile = (keyFile: string): string => keyFile.replace(/-\d+$/, "");

export const joinParts = (...parts: (string | null | undefined)[]): string => {
	const filled = parts.map((part) => part?.trim()).filter(Boolean);
	return filled.length ? filled.join(" · ") : DASH;
};
