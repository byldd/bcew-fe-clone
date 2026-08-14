import { addWeeks, endOfWeek, format, isSameMonth, startOfWeek } from "date-fns";

import { DATE_FORMAT } from "@/types/date";

import { IDashboardDateRange } from "../types";

const WEEK_OPTIONS = { weekStartsOn: 1 } as const; // Monday-first, matching the rest of the app's week views.

export const getWeekBounds = (anchor: Date): { start: Date; end: Date } => ({
	start: startOfWeek(anchor, WEEK_OPTIONS),
	end: endOfWeek(anchor, WEEK_OPTIONS),
});

export const getWeekRange = (anchor: Date): IDashboardDateRange => {
	const { start, end } = getWeekBounds(anchor);
	return {
		startDate: format(start, DATE_FORMAT.YYYY_MM_DD),
		endDate: format(end, DATE_FORMAT.YYYY_MM_DD),
	};
};

export const shiftWeek = (anchor: Date, direction: 1 | -1): Date => addWeeks(anchor, direction);

export const formatWeekRangeLabel = (anchor: Date): string => {
	const { start, end } = getWeekBounds(anchor);
	return isSameMonth(start, end)
		? `${format(start, DATE_FORMAT.DATE)} - ${format(end, DATE_FORMAT.DD_MMM)}`
		: `${format(start, DATE_FORMAT.DD_MMM)} - ${format(end, DATE_FORMAT.DD_MMM)}`;
};

export const formatToUSCurrency = (value: number, isCurrency?: boolean): string =>
	isCurrency ? `$${value.toLocaleString("en-US")}` : value.toLocaleString("en-US");
