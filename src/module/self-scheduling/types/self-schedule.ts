export type IEmployeeSelfScheduleResponse = {
	resolvedJobNames: { date: string; jobName: string }[];
	rejectedJobs: { projectName: string; error: string; date: string }[];
};
