import { Button } from "@/components/ui/button";
import { IJobHeaderProps } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { labelSelectionOrder, legendItems, legends } from "@/module/employee-dashboard/constants/legend-items";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { JobStatus } from "@/module/employee-dashboard/types";
import { ColorFor, getCardColorClass } from "@/module/schedule-management/weekly-schedule-management/utils/job-card";
import BackButton from "@/components/common/back-button";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export function JobHeader({ actrec, jobLabelAssignments, specialJob }: IJobHeaderProps) {
	const label =
		Array.isArray(jobLabelAssignments) && jobLabelAssignments.length
			? labelSelectionOrder
					.map((labelSelection) => jobLabelAssignments.find((jobLabel) => jobLabel.labelId === labelSelection))
					.find(Boolean) || jobLabelAssignments[0]
			: undefined;

	const Icon = statusIcons[label?.labelId as JobStatus];
	const legend = legendItems.find((item) => item.status === label?.labelId);
	const legendText = legend?.label ?? "";
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const notReady = jobLabelAssignments?.some((jobLabel) => jobLabel.labelId === legends.jobNotReady);

	return (
		<div className="mb-4 flex flex-wrap items-center justify-between gap-2 !p-0">
			<div className="flex min-w-0 items-center gap-2">
				<div className="flex-col items-center gap-2 py-2">
					<div className="flex items-center gap-2">
						<BackButton />
						<h1 className="font-inter text-xl font-semibold capitalize text-brand-dark">
							{specialJob ? specialJob.name : actrec?.jobnme}
						</h1>
					</div>
					{!specialJob && (
						<p className="ml-10 text-sm font-normal text-brand-dark">
							{tEmployee.job} #{actrec?.recnum}
						</p>
					)}
				</div>
			</div>

			<div className="mx-3 flex w-full items-center justify-between">
				<div key={label?.id} className="flex items-center gap-2">
					<span>{Icon}</span>
					<span className={getCardColorClass(label ? [label.labelId] : [], ColorFor.TEXT)}>{legendText}</span>
				</div>

				<div className="flex items-center gap-2">
					{notReady && (
						<Button className="h-[34px] whitespace-nowrap rounded-[5px] bg-brand-dark50 !px-3 !py-0 text-white hover:bg-brand-dark60">
							{tEmployee.markedAsNotReady}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
