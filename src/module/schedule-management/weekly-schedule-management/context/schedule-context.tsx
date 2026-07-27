"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
	IEmployeeDayTimeLookup,
	IScheduleContextType,
	IValidationErrors,
	IWeekScheduleResponse,
} from "../types/schedule-interface";
import {
	useQcInspectionForman,
	useScheduleCrews,
	useScheduleEmployeeDayTimes,
	useScheduleEmployees,
	useScheduleSubcontractors,
	useScheduleTeams,
	useValidateWeekSchedule,
	useWeekSchedule,
} from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { AxiosError } from "axios";

import { useSheet } from "@/hooks/useSheet";
import ValidationSheet from "../components/validation-sheet";
import { useScheduleParams } from "../hooks/useScheduleParams";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import ErrorMessageComponent from "@/components/get-error-message";
import { useHolidayConfiguration, useScheduleConfiguration } from "../hooks/useScheduleConfig";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { filterScheduleData } from "../utils/filter-data";
import useAuthStore from "@/store/auth-store";
import { useGetWeekendWorks, useGetZones } from "../../schedule-configuration/hooks/useScheduleConfig";
import { useSearchParams } from "next/navigation";
import { generateDates } from "../utils";
import { SCHEDULE_DOWNLOAD_MODAL_TYPE } from "../modals/enum";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";
import { useGetUserModuleAccess } from "@/module/profile/hooks/useProfile";
import { MODULE } from "@/utils/enums";
import { isProductionEnv } from "@/utils";

const ScheduleContext = createContext<IScheduleContextType>({
	validationErrors: [],
	onValidateSchedule: () => {},
	isValidatePending: false,
	schduleData: undefined,
	isFetchingSchedule: false,
	accessLevel: undefined,
	scheduleConfig: undefined,
	jobOnSaturday: false,
	jobOnSunday: false,
	employees: [],
	crews: [],
	subcontractors: [],
	search: "",
	setSearch: () => {},
	dailyJobsState: [],
	setDailyJobsState: () => {},
	inspectionForeman: [],
	isAllowedToModifyPastDates: false,
	teams: [],
	employeeDayTimesLookup: {},
	weekendWorks: [],
	weekendJobDates: [],
	taskLeaderMapByRecnum: new Map<number, IWeekScheduleResponse["jobTaskLeaders"]>(),
	zones: [],
	dataOfWeek: [],
});

const ScheduleProvider = ({ children }: { children: React.ReactNode }) => {
	const { getParams } = useScheduleParams();
	const {
		startDate,
		endDate,
		labelIds,
		withAssignments,
		startInRange,
		active,
		completed,
		stopNotInSequence,
		teamId,
		subcontractorCrewId,
		crewLeaderId,
		search: searchParam,
		pdfType,
	} = getParams();
	const searchParams = useSearchParams();
	const employeeName = searchParams.get("employeeName");

	const { data: moduleAccessLevel } = useGetUserModuleAccess(MODULE.WEEKLY_SCHEDULE);
	const { pageAccess } = useAdminPageAccessContext();

	const { data: holidays } = useHolidayConfiguration();

	const { mutate: validateSchedule, isPending: isValidatePending, error: validateError } = useValidateWeekSchedule();
	const { openSheet, Sheet, closeSheet } = useSheet();
	const { data: employees } = useScheduleEmployees({
		rosterStartDate: toMidnightDateString(startDate),
		rosterEndDate: toMidnightDateString(endDate),
	});
	const { data: teams } = useScheduleTeams();
	const [search, setSearch] = useState(employeeName || searchParam || "");
	const { user } = useAuthStore((state) => state);

	const isAllowedToModifyPastDates = user?.isPastDateScheduleUpdateAllowed;

	// NOTE: this is the state that is used to store the daily jobs in the schedule context
	// Whenever a daily job is created, updated, or deleted, this state is updated, to reflect changes quickly,
	// else after update and we refetch full schedule, it will take some time to reflect the changes
	const [dailyJobsState, setDailyJobsState] = useState<IWeekScheduleResponse["dailyJobs"]>([]);

	const sortedEmployees = employees?.sort((a, b) => {
		const firstNameA = a.user?.name?.split(",")[0]?.trim().toLowerCase() ?? "";
		const firstNameB = b.user?.name?.split(",")[0]?.trim().toLowerCase() ?? "";
		return firstNameA.localeCompare(firstNameB);
	});

	const queryClient = useQueryClient();

	const axiosError = validateError as AxiosError<{ errors: IValidationErrors[] }>;

	const { data: weekendWorks } = useGetWeekendWorks({
		startDate: toMidnightDateString(startDate),
		endDate: toMidnightDateString(endDate),
	});

	const { data: zones } = useGetZones();

	const onValidateSchedule = ({
		closeModal,
		startDate,
		endDate,
	}: {
		closeModal?: () => void;
		startDate: Date;
		endDate: Date;
	}) => {
		validateSchedule(
			{ startDate: toMidnightDateString(startDate), endDate: toMidnightDateString(endDate), teamId },
			{
				onSuccess: () => {
					openSuccessToast("Schedule validated successfully. No errors found.");
					if (closeModal) {
						closeModal();
					}
					queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
				},
				onError: (error) => {
					const toastErrors = error as AxiosError<{ errors: IValidationErrors[] }>;
					if (toastErrors.response?.data?.errors?.length) {
						openErrorToast({
							message: `Schedule validation failed. ${toastErrors.response?.data?.errors?.length} error(s) found.`,
						});

						openSheet({
							sheetView: <ValidationSheet errors={toastErrors.response?.data?.errors ?? []} onClose={closeSheet} />,
							showDefaultHeader: false,
							showDefaultClose: false,
						});
					} else {
						openErrorToast({
							error,
						});
					}

					if (closeModal) {
						closeModal();
					}
				},
			}
		);
	};

	const { data: scheduleConfig } = useScheduleConfiguration();
	const { data: crews } = useScheduleCrews({});
	const { data: subcontractors } = useScheduleSubcontractors();
	const { data: inspectionForeman } = useQcInspectionForman();

	const debouncedSearch = useDebounce(search.trim().replace(/\s+/g, " "), 500);

	const { data: schduleData, isLoading: isFetchingSchedule } = useWeekSchedule({
		startDate: toMidnightDateString(startDate),
		endDate: toMidnightDateString(endDate),
		labelIds,
		withAssignments,
		startInRange,
		active,
		completed,
		stopNotInSequence,
		teamId,
	});

	const { data: employeeDayTimes } = useScheduleEmployeeDayTimes({
		startDate: toMidnightDateString(startDate),
		endDate: toMidnightDateString(endDate),
	});

	const taskLeaderMapByRecnum = new Map<number, IWeekScheduleResponse["jobTaskLeaders"]>();

	schduleData?.jobTaskLeaders?.forEach((leader) => {
		if (!leader?.JobNum) {
			return;
		}
		if (!taskLeaderMapByRecnum.has(leader.JobNum)) {
			taskLeaderMapByRecnum.set(leader.JobNum, []);
		}
		taskLeaderMapByRecnum.get(leader.JobNum)?.push(leader);
	});

	const employeeDayTimesLookup = useMemo(() => {
		const index: IEmployeeDayTimeLookup = {};

		if (!employeeDayTimes?.length) return index;

		for (const dayTime of employeeDayTimes) {
			const dateKey = toMidnightDateString(toDate(dayTime.date));
			const empId = dayTime.employeeId;

			if (!index[dateKey]) index[dateKey] = {};
			index[dateKey][empId] = dayTime;
		}

		return index;
	}, [employeeDayTimes]);

	useEffect(() => {
		setDailyJobsState(schduleData?.dailyJobs ?? []);
	}, [schduleData]);

	const { filteredBcewJobs, filteredSpecialJobs } = useMemo(() => {
		return filterScheduleData(schduleData, debouncedSearch, subcontractorCrewId, crewLeaderId);
	}, [schduleData, debouncedSearch, subcontractorCrewId, crewLeaderId]);

	const weekendJobDates = schduleData?.dailyJobs
		?.filter((dailyJob) => toDate(dailyJob?.date).getDay() === 6 || toDate(dailyJob?.date).getDay() === 0)
		?.map((dailyJob) => toDate(dailyJob?.date));

	const dataOfWeek = generateDates({
		startDate: startDate,
		weekendJobDates: weekendJobDates || [],
		holidays,
		forPayroll: pdfType === SCHEDULE_DOWNLOAD_MODAL_TYPE.PAYROLL,
		weekendWorks: weekendWorks || [],
	});

	const accessLevel = isProductionEnv() ? moduleAccessLevel?.data.accessLevel : pageAccess?.accessLevel;

	const jobOnSaturday = !!schduleData?.dailyJobs?.some((dailyJob) => toDate(dailyJob?.date).getDay() === 6);
	const jobOnSunday = !!schduleData?.dailyJobs?.some((dailyJob) => toDate(dailyJob?.date).getDay() === 0);

	if (accessLevel === ACCESS_LEVEL.NONE) {
		return <ErrorMessageComponent message="You don't have access to this module" />;
	}

	return (
		<ScheduleContext.Provider
			value={{
				dataOfWeek,
				teams: teams ?? [],
				validationErrors: axiosError?.response?.data?.errors?.flatMap((error) => error) || [],
				onValidateSchedule,
				isValidatePending,
				schduleData: {
					...schduleData,
					dailyJobs: dailyJobsState || [],
					bcewJobs: filteredBcewJobs,
					specialJobs: filteredSpecialJobs,
				} as IWeekScheduleResponse,
				isFetchingSchedule,
				accessLevel: accessLevel,
				scheduleConfig,
				jobOnSaturday,
				jobOnSunday,
				employees: sortedEmployees ?? [],
				crews: crews?.items ?? [],
				subcontractors: subcontractors ?? [],
				search,
				setSearch,
				dailyJobsState,
				setDailyJobsState,
				inspectionForeman: inspectionForeman ?? [],
				isAllowedToModifyPastDates: !!isAllowedToModifyPastDates,
				employeeDayTimesLookup,
				weekendWorks: weekendWorks || [],
				weekendJobDates: weekendJobDates || [],
				taskLeaderMapByRecnum,
				zones: zones || [],
			}}
		>
			<Sheet />
			{children}
		</ScheduleContext.Provider>
	);
};

export const useScheduleContext = () => useContext(ScheduleContext);

export { ScheduleProvider };
