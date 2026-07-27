import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

const isNextDay = (a: Date, b: Date) => {
	const next = new Date(a);
	next.setDate(a.getDate() + 1);
	return next.toDateString() === b.toDateString();
};

export function groupContinuousShortDates(dates: string[]): string[] {
	if (!dates.length) return [];

	const parsed = dates
		.map((d) => {
			const date = new Date(d);
			return isNaN(date.getTime()) ? null : date;
		})
		.filter((d): d is Date => d !== null)
		.sort((a, b) => a.getTime() - b.getTime());

	if (parsed.length === 0) return [];

	const formatShort = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
	const result: string[] = [];

	let start: Date | null = null;
	let end: Date | null = null;

	for (const current of parsed) {
		if (!start || !end) {
			start = end = current;
			continue;
		}

		if (isNextDay(end, current)) {
			end = current;
		} else {
			result.push(
				start.getTime() === end.getTime() ? formatShort(start) : `${formatShort(start)} - ${formatShort(end)}`
			);
			start = end = current;
		}
	}

	// Push the last segment
	if (start && end) {
		result.push(start.getTime() === end.getTime() ? formatShort(start) : `${formatShort(start)} - ${formatShort(end)}`);
	}

	return result;
}

export function groupContinuousDates(dates: string[]): string[] {
	if (!dates.length) return [];

	const parsed: Date[] = dates.map((d) => new Date(d)).filter((d): d is Date => !isNaN(d.getTime()));

	if (parsed.length === 0) return [];

	parsed.sort((a, b) => a.getTime() - b.getTime());

	let start = parsed[0]!;
	let end = parsed[0]!;

	const result: string[] = [];

	for (let i = 1; i < parsed.length; i++) {
		const current = parsed[i]!;

		if (isNextDay(end, current)) {
			end = current;
		} else {
			result.push(
				start.getTime() === end.getTime()
					? toFormattedDate(start, DATE_FORMAT.MM_SLASH_DD_YYYY)
					: `${toFormattedDate(start, DATE_FORMAT.MM_SLASH_DD_YYYY)} - ${toFormattedDate(end, DATE_FORMAT.MM_SLASH_DD_YYYY)}`
			);
			start = end = current;
		}
	}

	// Push the last range
	result.push(
		start.getTime() === end.getTime()
			? toFormattedDate(start, DATE_FORMAT.MM_SLASH_DD_YYYY)
			: `${toFormattedDate(start, DATE_FORMAT.MM_SLASH_DD_YYYY)} - ${toFormattedDate(end, DATE_FORMAT.MM_SLASH_DD_YYYY)}`
	);

	return result;
}
