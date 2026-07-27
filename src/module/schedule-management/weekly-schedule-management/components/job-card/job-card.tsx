import React, { useRef, useState } from "react";
import { JobCardProps } from "../../types/schedule-interface";

import { usePopover } from "@/hooks/usePopover";
import JobCardPopover from "@/module/schedule-management/weekly-schedule-management/components/job-card/job-card-popover";

import {
	getCardColorClass,
	sortJobEmployee,
} from "@/module/schedule-management/weekly-schedule-management/utils/job-card";
import { cn } from "@/lib/utils/utils";
import { useScheduleContext } from "../../context/schedule-context";
import JobEmployee from "../job-employee";

import NoScheduleCard from "@/module/schedule-management/weekly-schedule-management/components/no-schedule-card/no-schedule-card";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import JobCardEditForm from "./job-card-edit-form";
import { legendItems, legends } from "@/module/employee-dashboard/constants/legend-items";
import { AppTooltip } from "@/components/ui/tooltip";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { JobStatus } from "@/module/employee-dashboard/types";
import { Pencil } from "lucide-react";
import { getTodayDate, toFormattedDate } from "@/lib/utils/date";
import QCRepairCardForm from "../qc-job/qc-repair-card-form";
import { SCHEDULE_ROW_TYPE } from "../../constants/week-schedule";
import { FORM_MODE } from "@/types";
import QcInspectionCardForm from "../qc-job/qc-inspection-card-form";
import { useScheduleParams } from "../../hooks/useScheduleParams";

const JobCard = ({
	dailyJobWithEmployee,
	day,
	onSelectWorker,
	dragSelectedWorkers,
	actualHours,
	subContractorForecastDate,
	setDragSelectedWorkers,
	rowType,
	bcewJob,
	specialJob,
}: JobCardProps) => {
	const { openPopover, Popover, isOpen, closePopover } = usePopover();
	const jobCardRef = useRef<HTMLDivElement>(null);
	const { accessLevel, isAllowedToModifyPastDates } = useScheduleContext();
	const [isEditing, setIsEditing] = useState(false);
	const { getParams } = useScheduleParams();
	const { pdf } = getParams();

	const isNewStartJob = dailyJobWithEmployee?.jobLabelAssignments?.some((label) => label.labelId === legends.newStart);

	const isPastDate = new Date(day.date) < getTodayDate();

	const { validationErrors } = useScheduleContext();
	if (!dailyJobWithEmployee) {
		return (
			<NoScheduleCard
				date={day.date}
				subContractorForecastDate={subContractorForecastDate}
				rowType={rowType}
				bcewJob={bcewJob}
				dayType={day.type}
				specialJob={specialJob}
			/>
		);
	}
	const isJobHasError = validationErrors.find((error) => {
		return error.dailyJobId === dailyJobWithEmployee?.id || error.dailyJobIds?.includes(dailyJobWithEmployee?.id);
	});

	const cardColorClass = getCardColorClass(
		dailyJobWithEmployee?.jobLabelAssignments?.map((label) => label.labelId) || []
	);

	const handleRightClickJob = (e: React.MouseEvent) => {
		if (accessLevel !== ACCESS_LEVEL.WRITE) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		openPopover({
			popoverView: (
				<JobCardPopover
					bcewJob={bcewJob}
					date={day.date}
					dailyJobWithEmployee={dailyJobWithEmployee}
					onClose={closePopover}
					rowType={rowType}
					specialJob={specialJob}
				/>
			),
		});
	};

	const renderForm = () => {
		if (rowType === SCHEDULE_ROW_TYPE.QC_REPAIR) {
			return (
				<QCRepairCardForm
					setIsEditing={setIsEditing}
					mode={FORM_MODE.EDIT}
					bcewJob={bcewJob}
					rowType={rowType}
					date={day.date}
					dailyJobWithEmployee={dailyJobWithEmployee}
				/>
			);
		}
		if (rowType === SCHEDULE_ROW_TYPE.QC_INSPECTION) {
			return (
				<QcInspectionCardForm
					setIsEditing={setIsEditing}
					mode={FORM_MODE.EDIT}
					bcewJob={bcewJob}
					date={day.date}
					dailyJobWithEmployee={dailyJobWithEmployee}
				/>
			);
		}
		return (
			<JobCardEditForm
				setIsEditing={setIsEditing}
				dailyJob={dailyJobWithEmployee}
				date={day.date}
				bcewJob={bcewJob}
				actualHours={actualHours}
				specialJob={specialJob}
				rowType={rowType}
			/>
		);
	};

	return (
		<div
			onClick={(e) => {
				e.stopPropagation();
				if (dragSelectedWorkers?.workers?.length > 0 && dragSelectedWorkers?.jobId !== dailyJobWithEmployee?.id) {
					setDragSelectedWorkers({
						workers: [],
						jobId: "",
					});
				}
			}}
			ref={jobCardRef}
			onContextMenu={handleRightClickJob}
			className={cn(
				"relative flex h-full flex-col items-center justify-start overflow-hidden rounded-lg border border-gray-300 bg-white p-3 text-center text-sm",
				cardColorClass,
				isOpen && "shadow-[0px_4.34px_11.93px_0px_#00000040]",
				isJobHasError && "border-red-500"
			)}
		>
			{isEditing ? (
				renderForm()
			) : (
				<>
					<div className="flex w-full items-center justify-between p-0">
						<div className="flex w-full items-center gap-2">
							{!pdf && (!isPastDate || isAllowedToModifyPastDates) && accessLevel === ACCESS_LEVEL.WRITE && (
								<Pencil
									onClick={() => {
										setIsEditing(true);
									}}
									className="h-3 w-3 cursor-pointer text-brand-dark30"
								/>
							)}
							<div className="flex w-full items-center justify-around">
								{!dailyJobWithEmployee?.isQcJob && !dailyJobWithEmployee?.subcontractor && !specialJob && (
									<>
										<AppTooltip text="Actual Hours" label={`AH: ${actualHours?.toFixed(2) || 0}`} />

										<AppTooltip
											text="Forecasted Hours"
											label={`FH: ${dailyJobWithEmployee?.forecastTime?.toFixed(2) || 0}`}
										/>
									</>
								)}
							</div>
						</div>
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

					{sortJobEmployee({
						jobEmployees: dailyJobWithEmployee?.jobEmployeeAssignments,
						crewLeaderId: dailyJobWithEmployee?.crewLeaderId,
						taskLeaderId: dailyJobWithEmployee?.taskLeaderId,
					}).map((jobEmployee) => (
						<JobEmployee
							onSelectWorker={onSelectWorker}
							key={jobEmployee.employeeId}
							employee={jobEmployee}
							dailyJobWithEmployee={dailyJobWithEmployee}
							dragSelectedWorkers={dragSelectedWorkers}
							bcewJob={bcewJob}
							isPastDate={isPastDate}
							specialJob={specialJob}
						/>
					))}

					{isNewStartJob && dailyJobWithEmployee?.schlin?.builderScheduleDate && (
						<div className="m-0 flex flex-col items-center justify-center gap-0 p-0 text-[8px] text-red-500">
							<p className="line m-0 line-clamp-1 text-nowrap p-0">Builder has rescheduled this job to </p>
							<p className="m-0 line-clamp-1 text-nowrap p-0">
								{toFormattedDate(dailyJobWithEmployee?.schlin?.builderScheduleDate)}
							</p>
						</div>
					)}
				</>
			)}

			<Popover />
		</div>
	);
};

export default JobCard;
