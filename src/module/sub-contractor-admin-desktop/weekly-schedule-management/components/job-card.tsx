import { AppTooltip } from "@/components/ui/tooltip";
import { usePopover } from "@/hooks/usePopover";
import { cn } from "@/lib/utils/utils";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { legendItems } from "@/module/employee-dashboard/constants/legend-items";
import { JobStatus } from "@/module/employee-dashboard/types";
import { JobCardProps } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { getCardColorClass } from "@/module/schedule-management/weekly-schedule-management/utils/job-card";
import React from "react";
import JobCardPopover from "./job-card-popover";
import { getTodayDate, toDate } from "@/lib/utils/date";
import NoScheduleCard from "./no-schedule-card";

const SubContractorCalendarJobCard = ({
	bcewJob,
	dailyJobWithEmployee,
	day,
	subContractorForecastDate,
}: Pick<JobCardProps, "bcewJob" | "dailyJobWithEmployee" | "day" | "subContractorForecastDate">) => {
	const { openPopover, Popover, isOpen, closePopover } = usePopover();

	const cardColorClass = getCardColorClass(
		dailyJobWithEmployee?.jobLabelAssignments?.map((label) => label.labelId) || []
	);

	const isJobIsInPast = dailyJobWithEmployee?.date && getTodayDate() > toDate(dailyJobWithEmployee?.date);

	if (!dailyJobWithEmployee) {
		return (
			<NoScheduleCard
				date={day.date}
				bcewJob={bcewJob}
				subContractorForecastDate={subContractorForecastDate}
				dayType={day.type}
			/>
		);
	}

	const handleRightClickJob = (e: React.MouseEvent) => {
		if (isJobIsInPast) return;
		e.preventDefault();
		e.stopPropagation();
		openPopover({
			popoverView: (
				<JobCardPopover
					bcewJob={bcewJob}
					date={day.date}
					dailyJobWithEmployee={dailyJobWithEmployee}
					onClose={closePopover}
				/>
			),
		});
	};
	return (
		<div
			onContextMenu={handleRightClickJob}
			className={cn(
				"relative flex h-full flex-col items-center justify-start overflow-hidden rounded-lg border border-gray-300 bg-white p-3 text-center text-sm",
				cardColorClass,
				isOpen && "shadow-[0px_4.34px_11.93px_0px_#00000040]"
			)}
		>
			<div className="flex w-full items-center justify-between p-0">
				<div></div>
				<div className="flex items-center justify-end gap-1">
					{dailyJobWithEmployee?.jobLabelAssignments?.map((label) => {
						const Icon = statusIcons[label.labelId as JobStatus];
						const legend = legendItems.find((item) => item.status === label.labelId);
						const tooltipText = legend?.description ?? legend?.label ?? "";
						return (
							<AppTooltip
								key={label.id}
								text={tooltipText}
								trigger={
									<div key={label.id} className="flex items-center gap-1">
										{Icon}
									</div>
								}
							/>
						);
					})}
				</div>
			</div>
			{dailyJobWithEmployee?.subcontractor && (
				<div className="">
					<p className="text-xs text-brand-dark50">{dailyJobWithEmployee?.subcontractor?.user?.name}</p>
				</div>
			)}
			{dailyJobWithEmployee?.subcontractorCrew?.name && (
				<div className="mt-2">
					<p className="text-xs text-brand-dark50">{dailyJobWithEmployee?.subcontractorCrew?.name}</p>
				</div>
			)}

			<Popover />
		</div>
	);
};

export default SubContractorCalendarJobCard;
