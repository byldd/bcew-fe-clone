import { isWithinInterval } from "date-fns";
import { IValidationErrors } from "../types/schedule-interface";

export const filterValidationError = ({
	errorsToShow,
	filterType,
	dateRange,
	paramStartDate,
	paramEndDate,
}: {
	errorsToShow: IValidationErrors[];
	filterType: string | null;
	dateRange: { startDate: Date; endDate: Date };
	paramStartDate: Date;
	paramEndDate: Date;
}) => {
	return errorsToShow.filter((err) => {
		const typeMatch = filterType ? err.type === filterType : true;
		const effectiveStart = dateRange.startDate || paramStartDate;
		const effectiveEnd = dateRange.endDate || paramEndDate;

		if (!err.date || !effectiveStart || !effectiveEnd) return typeMatch;

		try {
			const errorDate = new Date(err.date);
			if (isNaN(errorDate.getTime())) return typeMatch;
			return (
				typeMatch &&
				isWithinInterval(errorDate, {
					start: effectiveStart,
					end: effectiveEnd,
				})
			);
		} catch {
			return typeMatch;
		}
	});
};
