import { dateToUTCString, getTodayDate } from "@/lib/utils/date";
import { addMonths, subMonths } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

type ScheduleConfigParams = {
	startDate: string;
	endDate: string;
};

const scheduleConfigParamsKey = {
	startDate: "startDate",
	endDate: "endDate",
};

export const useScheduleConfigParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const today = getTodayDate();

	const startDate = searchParams.get(scheduleConfigParamsKey.startDate);
	const endDate = searchParams.get(scheduleConfigParamsKey.endDate);

	const getParams = () => {
		return {
			startDate: startDate || dateToUTCString(subMonths(today, 1)),
			endDate: endDate || dateToUTCString(addMonths(today, 1)),
		};
	};

	const setParams = (params: Partial<ScheduleConfigParams>) => {
		const previous = getParams();
		const newParams = new URLSearchParams();

		Object.entries(previous).forEach(([key, value]) => {
			if (value) newParams.set(scheduleConfigParamsKey[key as keyof typeof scheduleConfigParamsKey], value);
		});

		if (params.startDate === null) {
			newParams.delete(scheduleConfigParamsKey.startDate);
		} else if (params.startDate != undefined) {
			newParams.set(scheduleConfigParamsKey.startDate, params.startDate);
		}

		if (params.endDate === null) {
			newParams.delete(scheduleConfigParamsKey.endDate);
		} else if (params.endDate != undefined) {
			newParams.set(scheduleConfigParamsKey.endDate, params.endDate);
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
