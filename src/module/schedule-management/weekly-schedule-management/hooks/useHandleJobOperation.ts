import { useScheduleContext } from "../context/schedule-context";
import { IWeekScheduleResponse } from "../types/schedule-interface";

/**
 * This hook manages daily job operations.
 * To ensure faster UI updates after successful mutations, the state is updated immediately to reflect changes on the UI.
 */
export const useHandleJobOperation = () => {
	const { setDailyJobsState } = useScheduleContext();

	/**
	 * When a daily job is updated, the state is updated with the modified job.
	 * If all employees or subcontractors are removed from a job, it gets deleted on the server — so we also remove it from the state.
	 */
	const onUpdateDailyJob = ({
		updatedJob,
		dailyJobId,
	}: {
		updatedJob?: IWeekScheduleResponse["dailyJobs"][number];
		dailyJobId: string;
	}) => {
		if (!updatedJob?.id) {
			onDeleteDailyJob(dailyJobId);
			return;
		}
		setDailyJobsState((prev: IWeekScheduleResponse["dailyJobs"]) => {
			return prev.map((job) => (job.id === updatedJob.id ? updatedJob : job)) as IWeekScheduleResponse["dailyJobs"];
		});
	};

	const onCreateDailyJob = (createdJob: IWeekScheduleResponse["dailyJobs"][number]) => {
		setDailyJobsState((prev: IWeekScheduleResponse["dailyJobs"]) => {
			return [...prev, createdJob] as IWeekScheduleResponse["dailyJobs"];
		});
	};

	const onDeleteDailyJob = (deletedJobId: string) => {
		setDailyJobsState((prev: IWeekScheduleResponse["dailyJobs"]) => {
			return prev.filter((job) => job.id !== deletedJobId) as IWeekScheduleResponse["dailyJobs"];
		});
	};

	return {
		onUpdateDailyJob,
		onCreateDailyJob,
		onDeleteDailyJob,
	};
};
