import { toDate } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { GPS_EXCEPTION_EVENT_RULE } from "../types/gps-exception-event";
import { getTodayDate } from "@/lib/utils/date";

const gpsExceptionEventParamsKey = {
	date: "date",
	ruleId: "ruleId",
};

type GpsExceptionEventParams = {
	date: Date;
	ruleId: string;
};

export const useExceptionEventParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = () => {
		const paramsRuleId = searchParams.get(gpsExceptionEventParamsKey.ruleId);
		const paramDate = searchParams.get(gpsExceptionEventParamsKey.date);

		return {
			date: paramDate ? toDate(paramDate) : toDate(getTodayDate()),

			ruleId: paramsRuleId ? paramsRuleId : GPS_EXCEPTION_EVENT_RULE.AFTER_HOURS_USAGE,
		};
	};

	const setParams = (params: Partial<GpsExceptionEventParams>, persistPreviousParams = true) => {
		const previous = getParams();
		const newParams = new URLSearchParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value)
					newParams.set(gpsExceptionEventParamsKey[key as keyof typeof gpsExceptionEventParamsKey], value.toString());
			});
		}
		if (params.date === null) {
			newParams.delete(gpsExceptionEventParamsKey.date);
		} else if (params.date != undefined) {
			newParams.set(gpsExceptionEventParamsKey.date, params.date.toString());
		}

		if (params.ruleId === null) {
			newParams.delete(gpsExceptionEventParamsKey.ruleId);
		} else if (params.ruleId != undefined) {
			newParams.set(gpsExceptionEventParamsKey.ruleId, params.ruleId);
		}

		router.replace(`?${newParams.toString()}`);
	};

	return { getParams, setParams };
};
