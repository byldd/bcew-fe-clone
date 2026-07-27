import { TEAM_NAME, WEEK_DAY_NUMBERS } from "@/utils/enums";
import { JOB_PHASE_LABEL, SearchKeywords } from "../constants/week-schedule";
import { E_WEEKEND_WORKING_MODE, ISpecialJob } from "../types/schedule-configuration";
import { IScheduleEmployee, IWeekScheduleResponse, QC_JOB_TYPE } from "../types/schedule-interface";
import {
	E_WEEKEND_SCHEDULE_BY_MODE,
	E_WEEKEND_WORK_ADMIN_STATUS,
	IGetWeekendWorksResponse,
} from "../../schedule-configuration/types/schedule-config";
import { isSameDate, toDate } from "@/lib/utils/date";
import { IJoEmployeeOptions } from "../types/daily-job";
import { TimeSource } from "../../roster-time-configuration/enums";
import { EMPLOYEE_PHASES } from "@/module/employee/constants";

export const filterScheduleData = (
	data: IWeekScheduleResponse | undefined,
	search: string,
	subcontractorCrewId?: string,
	crewLeaderId?: string
) => {
	const searcForQCInspection =
		search && QC_JOB_TYPE.INSPECTION.toLocaleLowerCase().includes(search.toLocaleLowerCase());

	const searcForQCRepair = search && QC_JOB_TYPE.REPAIR.toLocaleLowerCase().includes(search.toLocaleLowerCase());

	const searchForMultiFamilyJobs = search && SearchKeywords.MULTI_FAMILY.toLowerCase().includes(search.toLowerCase());

	const filteredDailyJobs =
		data?.dailyJobs?.filter((dailyJob) => {
			const searchIncludes =
				dailyJob?.jobEmployeeAssignments?.some((jobEmployeeAssignment) => {
					return jobEmployeeAssignment?.employee?.user?.name?.toLowerCase().includes(search.toLowerCase());
				}) || dailyJob?.subcontractor?.user?.name?.toLowerCase().includes(search.toLowerCase());

			const subcontractorCrewIncludes = dailyJob?.subcontractorCrew?.id === subcontractorCrewId;

			const crewLeaderIncludes = dailyJob?.crewLeaderId === crewLeaderId;

			if (subcontractorCrewId || crewLeaderId) {
				if (search) {
					return searchIncludes && (subcontractorCrewIncludes || crewLeaderIncludes);
				}
				return subcontractorCrewIncludes || crewLeaderIncludes;
			}

			return searchIncludes;
		}) ?? [];

	const filteredBcewJobs =
		data?.bcewJobs?.filter((bcewJob) => {
			const includesDailyJob = filteredDailyJobs.some(
				(dailyJob) =>
					dailyJob?.bcewSchlinIdNum === bcewJob?.schlin?.idnum ||
					dailyJob?.bcewSchlinExtendedId === bcewJob?.schlinExtended?.id ||
					dailyJob?.bcewSrvinvIdNum === bcewJob?.srvinv?.idnum
			);

			if (subcontractorCrewId || crewLeaderId) {
				return includesDailyJob;
			}

			if (includesDailyJob) {
				return true;
			}
			if (bcewJob.schlin) {
				return (
					bcewJob.schlin.tsknme.toLowerCase().includes(search.toLowerCase()) ||
					bcewJob.schlin.tsknum.toString().includes(search.toLowerCase()) ||
					bcewJob.schlin.actrec.jobnme.toLowerCase().includes(search.toLowerCase()) ||
					bcewJob.schlin.actrec.recnum.toString().includes(search.toLowerCase()) ||
					(searchForMultiFamilyJobs && !!bcewJob.schlin.multiFamily)
				);
			} else if (bcewJob.srvinv) {
				return (
					bcewJob.srvinv.ordnum.toLowerCase().includes(search.toLowerCase()) ||
					bcewJob.srvinv.actrec.jobnme.toLowerCase().includes(search.toLowerCase()) ||
					bcewJob.srvinv.actrec?.weeklySchedulesSrvinv?.typnme?.toLowerCase().includes(search.toLowerCase()) ||
					bcewJob.srvinv.actrec.recnum.toString().includes(search.toLowerCase())
				);
			} else if (bcewJob.schlinExtended) {
				if (searcForQCInspection) {
					return !!bcewJob.schlinExtended.qc_rdy;
				}
				if (searcForQCRepair) {
					return !!bcewJob.schlinExtended.qcrcmp;
				}
				return (
					bcewJob.schlinExtended.tsknum.toString().includes(search.toLowerCase()) ||
					bcewJob.schlinExtended.actrec.jobnme.toLowerCase().includes(search.toLowerCase()) ||
					bcewJob.schlinExtended.actrec.recnum.toString().includes(search.toLowerCase()) ||
					JOB_PHASE_LABEL[bcewJob.schlinExtended.tsknum]?.toLowerCase().includes(search.toLowerCase())
				);
			}
		}) ?? [];

	const filteredSpecialJobs =
		data?.specialJobs?.filter((specialJob) => {
			if (subcontractorCrewId || crewLeaderId) {
				return false;
			}

			if (filteredDailyJobs.some((dailyJob) => dailyJob?.specialJobId === specialJob?.id)) {
				return true;
			}
			if (search) {
				return specialJob.name?.toLowerCase().includes(search.toLowerCase());
			}

			return true;
		}) ?? [];

	return {
		filteredBcewJobs,
		filteredSpecialJobs,
	};
};

export const getJobEmployeeOptions = ({
	employees,
	specialJob,
	date,
	weekendWorks,
	jobPhase,
	workOrder,
}: {
	employees: IScheduleEmployee[];
	specialJob?: Pick<ISpecialJob, "id" | "name" | "teams">;
	weekendWorks: IGetWeekendWorksResponse["data"];
	date: Date | string | null;
	jobPhase?: number;
	workOrder?: string;
}): IJoEmployeeOptions[] => {
	const teamEmployees = specialJob
		? employees?.filter((employee) => specialJob?.teams?.some((team) => team.teamId === employee.user?.teamId))
		: employees?.filter((employee) => employee.user?.team?.name === TEAM_NAME?.FIELD);

	const filteredTeamEmployees =
		jobPhase || workOrder
			? teamEmployees?.filter((employee) => {
					const employeePhases: string[] = employee.user?.phases ? JSON.parse(employee.user?.phases) : [];

					if (!employeePhases?.length) {
						return true;
					}

					if (workOrder) {
						return employeePhases.includes(EMPLOYEE_PHASES.WORK_ORDER);
					}
					if (jobPhase && EMPLOYEE_PHASES[jobPhase]) {
						return employeePhases.includes(EMPLOYEE_PHASES[jobPhase]);
					}
					return true;
				})
			: teamEmployees;

	return filteredTeamEmployees.map((employee) => {
		const roster = date
			? (employee?.user?.rosterTimes?.find((roster) => isSameDate(roster.date, date)) as
					| IScheduleEmployee["user"]["rosterTimes"][number]
					| null)
			: null;

		const isWeekendDate =
			!!date &&
			(toDate(date)?.getDay() === WEEK_DAY_NUMBERS.SATURDAY || toDate(date)?.getDay() === WEEK_DAY_NUMBERS.SUNDAY);

		const weekendWork = weekendWorks?.find(
			(weekendWork) =>
				date &&
				weekendWork.date &&
				isSameDate(weekendWork.date, date) &&
				weekendWork?.scheduleByMode == E_WEEKEND_SCHEDULE_BY_MODE.ADMIN
		);

		const isEmployeeAllowedWeekendWorking =
			isWeekendDate &&
			weekendWork &&
			(employee?.user?.isWeekendSelfSchedulingAllowed ||
				weekendWork?.userWeekendWorks?.some(
					(userWeekendWork) =>
						userWeekendWork.userId === employee?.user?.id &&
						userWeekendWork?.adminStatus == E_WEEKEND_WORK_ADMIN_STATUS.APPROVED
				));

		const isDisabled =
			roster?.timeSource == TimeSource.NOT_WORKING || (isWeekendDate && !isEmployeeAllowedWeekendWorking);

		return {
			employeeId: employee.id,
			label: employee?.user?.name,
			employeeName: employee?.user?.name,
			disabled: isDisabled,
		};
	});
};
