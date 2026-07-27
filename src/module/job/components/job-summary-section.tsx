import { Separator } from "@/components/ui/separator";
import { IJobSummarySectionProps } from "../types";
import { CollapsibleSection } from "./collapsible-section";
import { EmployeeTimeLogCard } from "./employee-time-log-card";
import { JobEmployeeTable } from "./job-employee-table";
import { JobOverviewCard } from "./job-overview-card";

export function JobSummarySection({
	jobName,
	jobPhase,
	jobAddress,
	jobData,
	employeeAssignment,
	jobEmployeeAssignments,
	handleYouTag,
	handleTaskLeader,
}: IJobSummarySectionProps) {
	return (
		<div className="rounded-[10px] border border-brand-dark10 bg-white px-4 py-3">
			<CollapsibleSection
				contentClassName="space-y-4"
				title={
					<div className="flex items-center justify-between gap-3">
						<span className="font-inter text-base font-semibold text-brand-dark">{jobName || "--"}</span>
						{jobPhase ? (
							<span className="whitespace-nowrap text-sm font-semibold text-brand-green">{jobPhase}</span>
						) : null}
					</div>
				}
			>
				{jobAddress && (
					<>
						<div className="space-y-1">
							<p className="text-xs font-medium text-brand-dark50">Location</p>
							<p className="text-sm font-semibold text-brand-dark">{jobAddress}</p>
						</div>

						<Separator className="bg-brand-dark10" />
					</>
				)}

				<JobOverviewCard jobData={jobData} />

				<Separator className="bg-brand-dark10" />

				<EmployeeTimeLogCard user={employeeAssignment} />

				<JobEmployeeTable
					jobEmployeeAssignments={jobEmployeeAssignments}
					handleYouTag={handleYouTag}
					handleTaskLeader={handleTaskLeader}
				/>
			</CollapsibleSection>
		</div>
	);
}
