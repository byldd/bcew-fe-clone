"use client";
import { Card, CardContent } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IJobCardProps, JobStatus } from "../types";
import { statusIcons } from "../constants/job-status-icons";
import { legends } from "../constants/legend-items";
import { getCardColorClass } from "@/module/schedule-management/weekly-schedule-management/utils/job-card";
import { cn } from "@/lib/utils/utils";
import {
	JOB_PHASE_LABEL,
	SCHEDULE_ROW_TYPE_LABEL,
} from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";
import { QC_JOB_TYPE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import RescheduleModal from "./reschedule-modal";
import { getTodayDate, isSameDate, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export function JobCard({ job, onClick }: IJobCardProps) {
	const { Modal, openModal, closeModal } = useModal();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const showWaitingForConfirmation = job.jobDailyRecord.jobLabelAssignments.some(
		(jobLabelAssignment) =>
			(jobLabelAssignment.labelId === legends.newStart || jobLabelAssignment.labelId === legends.warrantyJob) &&
			job?.jobDailyRecord?.notReadyUpdate?.isApproved === false
	);
	const cardColorClass = getCardColorClass(
		job?.jobDailyRecord?.jobLabelAssignments?.map((label) => label.labelId) || []
	);
	const qcType = job.jobDailyRecord?.qcType;
	const qcJobType = qcType
		? `${qcType === QC_JOB_TYPE.REPAIR ? SCHEDULE_ROW_TYPE_LABEL.QC_REPAIR : SCHEDULE_ROW_TYPE_LABEL.QC_INSPECTION}`
		: null;

	const isQcInspection = qcType === QC_JOB_TYPE.INSPECTION;
	const isTodayDate = isSameDate(new Date(job.jobDailyRecord.date), getTodayDate());

	return (
		<div className="relative flex cursor-pointer flex-row items-center px-2">
			<Modal />
			<div className="mr-2 flex min-w-[45px] flex-col items-center">
				<div className="text-xs font-medium text-brand-dark50">
					{tEmployee.stop} {job.stopNumber}
				</div>
			</div>
			<div className="absolute left-12 top-1/2 w-3 border-t-[1px] border-brand-lightgrey"></div>
			<Card onClick={() => onClick?.(job)} className={cn("w-[350px] !border-l-4", cardColorClass)}>
				<CardContent className="w-full px-4 py-2">
					<div className="w-full flex-1">
						<div className="flex items-center justify-between gap-8">
							<div>
								{!job.jobDailyRecord.specialJobId && (
									<h3 className="font-inter text-xs font-semibold capitalize text-brand-dark">
										{tEmployee.job} #{job.jobDailyRecord.recnum + " "}
										<span className="font-inter text-xs font-semibold leading-tight text-brand-dark50">
											(
											{job.jobDailyRecord?.weeklySchedulesSrvinv ? (
												<span className="w-full">
													{job.jobDailyRecord?.weeklySchedulesSrvinv?.split(" ")[0]} - {job.jobDailyRecord.tsknme}
												</span>
											) : job.jobDailyRecord.isQcJob ? (
												<>
													{JOB_PHASE_LABEL[Number(job.jobDailyRecord?.tsknme)]}
													{qcJobType ? `) (` + qcJobType : ""}
												</>
											) : (
												job.jobDailyRecord.tsknme
											)}
											)
										</span>
									</h3>
								)}
							</div>
							<div className="mb-2 flex items-center gap-4">
								{job?.jobDailyRecord?.jobLabelAssignments?.map((label) => {
									const Icon = statusIcons[label.labelId as JobStatus];
									return (
										<div key={label.id} className="flex items-center gap-1">
											{Icon}
										</div>
									);
								})}
							</div>
						</div>

						<div className="mb-2 flex items-center justify-between gap-6">
							<div className="flex-wrap">
								<h4 className="font-inter text-xs font-semibold capitalize text-brand-dark">
									{job.jobDailyRecord.jobnme}
								</h4>
							</div>
							<div>
								{job.jobDailyRecord.crewLeader.crewLeaderName && (
									<div className="flex items-center space-x-1 text-[10px] text-brand-dark">
										<Avatar className="h-4 w-4">
											<AvatarImage src="/assets/png/profile.png" alt="Crew Leader" />
											<AvatarFallback className="border text-[0.5rem]">CL</AvatarFallback>
										</Avatar>
										<span className="font-inter text-[10px] font-medium text-brand-dark">
											{job.jobDailyRecord.crewLeader.crewLeaderName}
										</span>
									</div>
								)}
							</div>
						</div>
						{job.hours && (
							<div className="flex items-center justify-between text-[10px] font-semibold text-brand-dark50">
								{showWaitingForConfirmation ? (
									<span>{tEmployee.waitingForConfirmation}</span>
								) : (
									job.hours && (
										<div className="flex items-center space-x-1">
											<span className="font-inter text-[10px] font-semibold text-brand-dark50">
												{tEmployee.assignedHours}
											</span>
										</div>
									)
								)}
								<div>
									<span className="font-inter text-[10px] font-semibold text-brand-dark">{job.hours}</span>
									<span className="ml-1 font-inter text-[10px] font-semibold text-brand-dark">{tEmployee.hrs}</span>
								</div>
							</div>
						)}
						{job.startTime && job.endTime && (
							<div className="flex items-center justify-between text-[10px] font-semibold text-brand-dark50">
								<span>{tEmployee.loggedTime}:</span>
								<span className="font-inter text-[10px] font-semibold text-brand-dark">{` ${toFormattedDate(job?.overrideStartTime ?? job.startTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(job?.overrideEndTime ?? job.endTime, DATE_FORMAT.HH_MM_AA_PM)}`}</span>
							</div>
						)}
						{job.didNotWorked && (
							<div className="flex items-center justify-end">
								<span className="font-inter text-[10px] font-medium text-brand-dark">Did Not Work</span>
							</div>
						)}
						{job.overrideStartTime && job.overrideEndTime && (
							<div className="flex items-center justify-between text-[10px] font-semibold text-brand-dark50">
								<span>{tEmployee.adminOverrideTime}:</span>
								<span className="font-inter text-[10px] font-semibold text-brand-dark">{` ${toFormattedDate(job.overrideStartTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(job.overrideEndTime, DATE_FORMAT.HH_MM_AA_PM)}`}</span>
							</div>
						)}

						{isTodayDate && isQcInspection && (
							<div className="flex items-center justify-between text-[10px] font-semibold text-brand-dark50">
								<Button
									variant="ghost"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										openModal({
											modalTitle: `Reschedule Job ${job.jobDailyRecord.jobnme}`,
											modalView: <RescheduleModal onClose={closeModal} dailyJobId={job.jobDailyRecord.id} />,
										});
									}}
								>
									{tEmployee.reschedule}
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
