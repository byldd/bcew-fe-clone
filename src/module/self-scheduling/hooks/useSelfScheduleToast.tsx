import { openErrorToast, openSuccessToast } from "@/components/toast";
import { toFormattedDate } from "@/lib/utils/date";
import { IEmployeeSelfScheduleResponse } from "../types/self-schedule";

export const useSelfScheduleToast = () => {
	const handleToast = (responseData: IEmployeeSelfScheduleResponse) => {
		const { resolvedJobNames, rejectedJobs } = responseData;
		if (rejectedJobs?.length) {
			openErrorToast({
				message: (
					<div className="space-y-2">
						<p>Jobs could not be scheduled</p>
						<ul className="list-disc pl-4">
							{rejectedJobs.map((job) => (
								<li key={`${job.projectName}-${job.date}`}>
									{job.projectName} on {toFormattedDate(job.date)} - Reason: {job.error}
								</li>
							))}
						</ul>
					</div>
				),
			});
		}
		if (resolvedJobNames?.length) {
			openSuccessToast(
				<div className="space-y-2">
					<p>Job{resolvedJobNames.length > 1 ? "s" : ""} scheduled successfully</p>
					<ul className="list-disc pl-4">
						{resolvedJobNames.map((job) => (
							<li key={`${job.jobName}-${job.date}`}>
								{job.jobName} on {toFormattedDate(job.date)}
							</li>
						))}
					</ul>
				</div>
			);
		}
	};

	return { handleToast };
};
