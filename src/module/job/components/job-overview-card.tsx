import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { JobStatus } from "@/module/employee-dashboard/types";
import { toFormattedDate } from "@/lib/utils/date";
import { IJobOverviewCardProps } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import TaskLeaderList from "@/module/schedule-management/weekly-schedule-management/components/calendar/task-leader-list";

export function JobOverviewCard({ jobData }: IJobOverviewCardProps) {
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const { zone } = jobData;

	if (jobData?.specialJob) {
		return (
			<div className="grid grid-cols-2 gap-4 text-xs font-medium text-brand-dark50">
				<div className="space-y-[2px]">
					<p>{tEmployee.date}</p>
					<p className="text-sm font-medium text-brand-dark">{jobData?.date ? toFormattedDate(jobData?.date) : "--"}</p>
				</div>
				{zone && (
					<div className="space-y-[2px]">
						<p>Address</p>
						<p className="text-sm font-medium text-brand-dark">
							{zone?.address} <span className="text-brand-grey">({zone?.name})</span>
						</p>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="grid grid-cols-2 gap-4 text-xs font-medium text-brand-dark50">
				<div className="space-y-[2px]">
					<p>{tEmployee.date}</p>
					<p className="text-sm font-medium text-brand-dark">{jobData?.date ? toFormattedDate(jobData?.date) : "--"}</p>
				</div>
				<div className="space-y-[2px]">
					<p>{tSub.crewLeader}</p>
					<p className="text-sm font-medium text-brand-dark">{jobData?.crewLeader?.user?.name}</p>
				</div>
				<div className="space-y-[2px]">
					<p>{tCommon.status}</p>
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
						<p>{tEmployee.foreman}</p>
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
			<Accordion type="single" className="w-full" collapsible defaultValue="item-1">
				<AccordionItem value="item-1">
					<AccordionTrigger className="text-brand-grey">{tSchedule.crewLeaderDetails}</AccordionTrigger>
					<AccordionContent>
						<TaskLeaderList taskLeaders={jobData?.taskLeaders || []} />
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
