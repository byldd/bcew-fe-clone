export const getWeekRangeString = (startDate: Date, endDate: Date) => {
	const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
	const startStr = startDate.toLocaleDateString("en-US", options);
	const endStr = endDate.toLocaleDateString("en-US", options);
	return `${startStr} - ${endStr}`;
};
