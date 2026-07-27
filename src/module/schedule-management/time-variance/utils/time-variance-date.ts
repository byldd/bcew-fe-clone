import { getTodayDate, isSameDate, toDate } from "@/lib/utils/date";
import { ITimeVarianceResponse } from "./types";
import { subYears } from "date-fns";

export const getMinAndMaxTimeVarianceDate = ({
	timeVarianceData,
}: {
	timeVarianceData: ITimeVarianceResponse[] | undefined;
}) => {
	let minDate = getTodayDate();
	let maxDate = subYears(getTodayDate(), 1); // initialize with a min date
	const maxDateColumn = 7;

	timeVarianceData?.forEach((data) => {
		data?.timeVariance?.forEach((item) => {
			if (minDate?.getTime() > toDate(item.date)?.getTime()) {
				minDate = toDate(item.date);
			}

			if (maxDate?.getTime() < toDate(item.date)?.getTime()) {
				maxDate = toDate(item.date);
			}
		});
	});

	const dateRange = [];

	let currentMaxDate = maxDate;
	while (minDate <= currentMaxDate && dateRange?.length < maxDateColumn) {
		if (timeVarianceData?.some((data) => data?.timeVariance?.some((item) => isSameDate(item.date, currentMaxDate)))) {
			dateRange.push(currentMaxDate);
		}

		currentMaxDate = new Date(currentMaxDate);
		currentMaxDate.setDate(currentMaxDate.getDate() - 1);
	}

	const sortedDate = dateRange?.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

	return {
		dates: sortedDate,
		startDate: sortedDate[0] || minDate,
		endDate: sortedDate[sortedDate.length - 1] || maxDate,
	};
};
