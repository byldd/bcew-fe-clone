import { useRouter, useSearchParams } from "next/navigation";
import { getTodayDate, toDate, toMidnightDateString } from "@/lib/utils/date";
import { subMonths } from "date-fns";

type PayRollParams = {
	startDate: string;
	endDate: string;
};

const payRollParamsKey = {
	startDate: "startDate",
	endDate: "endDate",
};

export const usePayRollParams = () => {
	const router = useRouter();

	const searchParams = useSearchParams();

	const startDate = searchParams.get(payRollParamsKey.startDate) || subMonths(getTodayDate(), 1);
	const endDate = searchParams.get(payRollParamsKey.endDate) || getTodayDate();

	const getParams = (): PayRollParams => {
		return {
			startDate: toMidnightDateString(toDate(startDate)),
			endDate: toMidnightDateString(toDate(endDate)),
		};
	};

	const setParams = (params: Partial<PayRollParams>) => {
		const previous = getParams();

		const newParams = new URLSearchParams();

		Object.entries(previous).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				newParams.set(payRollParamsKey[key as keyof typeof payRollParamsKey], value.toString());
			}
		});

		if (params.startDate !== undefined) {
			newParams.set(payRollParamsKey.startDate, params.startDate.toString());
		}

		if (params.endDate !== undefined) {
			newParams.set(payRollParamsKey.endDate, params.endDate.toString());
		}

		router.replace(`?${newParams.toString()}`, {
			scroll: false,
		});
	};

	return {
		getParams,
		setParams,
	};
};
