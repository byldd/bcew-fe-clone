"use client";
import React, { createContext, useContext, useState } from "react";

import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { useScheduleParams } from "@/module/schedule-management/weekly-schedule-management/hooks/useScheduleParams";
import { IScheduleContextType } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { useSubContractorWeekSchedule } from "../hooks/useSubcontractoSchedule";
import useAuthStore from "@/store/auth-store";
import { useSubContractorCrews } from "@/module/sub-contractor/hooks/useSubContractorCrew";
import { ISubContractorCrewsResponse } from "@/module/sub-contractor/types";
import { SUB_CONTRACTOR_CREW_STATUS } from "@/module/admin-sub-contractor/types";

const SubContractorScheduleContext = createContext<
	Pick<
		IScheduleContextType,
		"schduleData" | "isFetchingSchedule" | "jobOnSaturday" | "jobOnSunday" | "search" | "setSearch"
	> & {
		subContractorCrews: ISubContractorCrewsResponse["crews"];
	}
>({
	schduleData: undefined,
	isFetchingSchedule: false,
	jobOnSaturday: false,
	jobOnSunday: false,
	search: "",
	setSearch: () => {},
	subContractorCrews: [],
});

const SubContractorScheduleProvider = ({ children }: { children: React.ReactNode }) => {
	const [search, setSearch] = useState("");
	const { user, subcontractorCrew } = useAuthStore((state) => state);

	const { getParams } = useScheduleParams();
	const { startDate, endDate } = getParams();

	const { data: schduleData, isLoading: isFetchingSchedule } = useSubContractorWeekSchedule({
		startDate: toMidnightDateString(startDate),
		endDate: toMidnightDateString(endDate),
	});

	const { data: subContractorCrews } = useSubContractorCrews(user, subcontractorCrew, {
		crewStatus: SUB_CONTRACTOR_CREW_STATUS.ACTIVE,
	});

	const jobOnSaturday = !!schduleData?.dailyJobs?.some((dailyJob) => toDate(dailyJob?.date).getDay() === 6);
	const jobOnSunday = !!schduleData?.dailyJobs?.some((dailyJob) => toDate(dailyJob?.date).getDay() === 0);

	return (
		<SubContractorScheduleContext.Provider
			value={{
				schduleData: schduleData,
				isFetchingSchedule,
				jobOnSaturday,
				jobOnSunday,
				search,
				setSearch,
				subContractorCrews: subContractorCrews?.crews ?? [],
			}}
		>
			{children}
		</SubContractorScheduleContext.Provider>
	);
};

export const useSubContractorScheduleContext = () => useContext(SubContractorScheduleContext);

export { SubContractorScheduleProvider };
