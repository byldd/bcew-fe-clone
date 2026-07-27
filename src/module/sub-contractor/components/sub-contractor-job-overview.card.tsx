import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { JobStatus } from "@/module/employee-dashboard/types";
import { formatDateToMMDDYYYY } from "@/module/schedule-management/time-logs-management/utils";
import { ISubContractorDailyJobDetailsResponse } from "../types";

export interface ISubContractorJobOverviewCardProps {
	jobData: ISubContractorDailyJobDetailsResponse;
}

export function SubContractorJobOverviewCard({ jobData }: ISubContractorJobOverviewCardProps) {
	return (
		<div className="rounded-[10px] border border-brand-dark10 bg-white px-6 py-3">
			<div className="grid grid-cols-2 gap-4 text-xs font-medium text-brand-dark50">
				<div className="space-y-[2px]">
					<p>Date</p>
					<p className="text-sm font-medium text-brand-dark">{formatDateToMMDDYYYY(jobData?.date)}</p>
				</div>
				<div className="space-y-[2px]">
					<p>Crew Leader</p>
					<p className="text-sm font-medium text-brand-dark">{jobData?.subcontractorCrew?.crewLeaderName || "--"}</p>
				</div>
				<div className="space-y-[2px]">
					<p>Phase</p>
					<p className="text-sm font-medium text-brand-dark">
						{jobData?.schlin?.tsknme ||
							jobData?.qcJob?.schlin?.tsknme ||
							`${jobData?.srvinv?.typnme?.split(" ")[0]} - ${jobData?.srvinv?.ordnum}`}
						{jobData?.qcJob ? `(${jobData?.qcJob?.type})` : ""}
					</p>
				</div>
				<div className="space-y-[2px]">
					<p>Status</p>
					<div className="mb-2 flex items-center gap-4 space-y-[2px]">
						{jobData?.jobLabelAssignments?.map((label) => {
							const Icon = statusIcons[label.labelId as JobStatus];
							return (
								<div key={label.id} className="mt-1 flex items-center gap-1">
									{Icon}
								</div>
							);
						})}
					</div>
				</div>
				{jobData?.foreman && (
					<div className="space-y-[2px]">
						<p>Foreman</p>
						<div className="mb-2 flex items-center gap-4 space-y-[2px] text-sm font-medium text-brand-dark">
							{jobData?.foreman}
						</div>
					</div>
				)}

				{jobData?.foreman && jobData?.phoneNumber && (
					<div className="space-y-[2px]">
						<p>Phone Number</p>
						<div className="mb-2 flex items-center gap-4 text-sm font-medium text-brand-dark">
							<a href={`tel:${jobData.phoneNumber}`} className="text-brand-dark hover:underline">
								{jobData.phoneNumber}
							</a>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
