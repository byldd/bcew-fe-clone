import { getTodayDate, toDate } from "@/lib/utils/date";
import { addDays } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

type ScheduleHistoryParams = {
	startDate: Date;
	endDate: Date;
};

const scheduleHistoryParamsKey = {
	startDate: "startDate",
	endDate: "endDate",
};

export const useScheduleHistoryParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = () => {
		const paramStartDate = searchParams.get(scheduleHistoryParamsKey.startDate);
		const paramEndDate = searchParams.get(scheduleHistoryParamsKey.endDate);
		return {
			startDate: paramStartDate ? toDate(new Date(paramStartDate)) : toDate(getTodayDate()),
			endDate: paramEndDate ? toDate(new Date(paramEndDate)) : toDate(addDays(getTodayDate(), 7)),
		};
	};

	const setParams = (params: Partial<ScheduleHistoryParams>, persistPreviousParams = true) => {
		const previous = getParams();
		const newParams = new URLSearchParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value)
					newParams.set(scheduleHistoryParamsKey[key as keyof typeof scheduleHistoryParamsKey], value.toString());
			});
		}

		if (params.startDate !== undefined) {
			newParams.set(scheduleHistoryParamsKey.startDate, params.startDate?.toString() || "");
		}

		if (params.endDate !== undefined) {
			newParams.set(scheduleHistoryParamsKey.endDate, params.endDate?.toString() || "");
		}
		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
