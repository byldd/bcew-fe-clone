import { useModal } from "@/hooks/useModal";
import { CreateDailyJobModal } from "@/module/schedule-management/weekly-schedule-management/modals/create-daily-job-modal";
import { openErrorToast } from "@/components/toast";
import { isSameDate, getTodayDate } from "@/lib/utils/date";

import { LuCalendarOff } from "react-icons/lu";
import { cn } from "@/lib/utils/utils";
import { getCardColorClass } from "@/module/schedule-management/weekly-schedule-management/utils/job-card";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { JobStatus } from "@/module/employee-dashboard/types";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { SCHEDULE_ROW_TYPE } from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";
import { useScheduleContext } from "@/module/schedule-management/weekly-schedule-management/context/schedule-context";
import { ACCESS_LEVEL } from "@/module/employee/enums";

import { Plus } from "lucide-react";
import { useState } from "react";

import NoScheduleForm from "./no-schedule-form";
import { QcInspectionJobModal } from "../../modals/qc-job/qc-inspection-job-modal";
import { CreateQcRepairModal } from "../../modals/qc-job/create-qc-repair-modal";
import { holidayTypes } from "../../utils/enums";
import { FORM_MODE } from "@/types";
import SpcialJobModal from "../../modals/special-job/special-job-modal";
import { INoScheduleCardProps } from "../../types/card-props";
import QCRepairCardForm from "../qc-job/qc-repair-card-form";
import QcInspectionCardForm from "../qc-job/qc-inspection-card-form";
import { useScheduleParams } from "../../hooks/useScheduleParams";

const NoScheduleCard = ({
	date,
	subContractorForecastDate,
	rowType,
	bcewJob,
	dayType,
	specialJob,
}: INoScheduleCardProps) => {
	const { openModal, Modal, closeModal } = useModal();
	const { accessLevel, isAllowedToModifyPastDates } = useScheduleContext();
	const [isEditing, setIsEditing] = useState(false);
	const { getParams } = useScheduleParams();
	const { pdf } = getParams();

	const actrec = bcewJob?.schlin?.actrec || bcewJob?.srvinv?.actrec;
	const isPastDate = new Date(date) < getTodayDate();

	const { validationErrors } = useScheduleContext();

	const isJobHasError = validationErrors.find((error) => {
		return error.bcewScheduledJobId === bcewJob?.schlin?.idnum || error.bcewScheduledJobId === bcewJob?.srvinv?.idnum;
	});

	const jobStartDate = bcewJob?.schlin?.fxddte || bcewJob?.srvinv?.schdte;
	const qcJobStartDate =
		rowType === SCHEDULE_ROW_TYPE.QC_REPAIR
			? bcewJob?.schlinExtended?.qcrcmp
			: rowType === SCHEDULE_ROW_TYPE.QC_INSPECTION
				? bcewJob?.schlinExtended?.qc_rdy
				: null;

	const isTodayToBeStarted =
		jobStartDate && rowType === SCHEDULE_ROW_TYPE.DAILY_JOB
			? isSameDate(date, jobStartDate)
			: qcJobStartDate && (rowType === SCHEDULE_ROW_TYPE.QC_REPAIR || rowType === SCHEDULE_ROW_TYPE.QC_INSPECTION)
				? isSameDate(date, qcJobStartDate)
				: false;

	const handleCreateDailyJob = () => {
		if (accessLevel !== ACCESS_LEVEL.WRITE) {
			return;
		}
		if (isPastDate && !isAllowedToModifyPastDates) {
			openErrorToast({ message: "Jobs cannot be scheduled for past dates." });
			return;
		}
		if (rowType === SCHEDULE_ROW_TYPE.SPECIAL_JOB && specialJob) {
			openModal({
				modalTitle: `${specialJob.name} Job`,
				modalView: (
					<SpcialJobModal closeModal={closeModal} mode={FORM_MODE.CREATE} specialJob={specialJob} date={date} />
				),
				variant: "medium",
			});
			return;
		}
		if (rowType === SCHEDULE_ROW_TYPE.QC_REPAIR && bcewJob) {
			openModal({
				modalTitle: "Create QC Repair",
				modalView: (
					<CreateQcRepairModal
						isTodayToBeStarted={isTodayToBeStarted}
						bcewJob={bcewJob}
						date={date}
						closeModal={closeModal}
						mode={FORM_MODE.CREATE}
					/>
				),
				variant: "medium",
			});
			return;
		}

		if (rowType === SCHEDULE_ROW_TYPE.QC_INSPECTION && bcewJob) {
			openModal({
				modalTitle: "Create QC Job Inspection",
				modalView: (
					<QcInspectionJobModal
						isTodayToBeStarted={isTodayToBeStarted}
						bcewJob={bcewJob}
						date={date}
						closeModal={closeModal}
						mode={FORM_MODE.CREATE}
					/>
				),
				variant: "medium",
			});
			return;
		}

		openModal({
			modalTitle: (
				<p className="text-sm font-semibold text-brand-dark">
					{`${actrec?.jobnme} (${bcewJob?.schlin ? bcewJob?.schlin?.tsknme : bcewJob?.srvinv?.ordnum})`}
				</p>
			),
			modalView: <CreateDailyJobModal bcewJob={bcewJob} date={date} closeModal={closeModal} specialJob={specialJob} />,
			variant: "medium",
		});
	};

	const isSubContractorForecastDate = subContractorForecastDate
		? isSameDate(new Date(date), new Date(subContractorForecastDate))
		: false;

	const cardColorClass = getCardColorClass(
		isSubContractorForecastDate ? [legends.subContractorJob] : isTodayToBeStarted ? [legends.newStart] : []
	);

	const legendItems = [
		...(isSubContractorForecastDate
			? [
					{
						labelId: legends.subContractorJob,
						id: "subcontractor-job",
						description: "Subcontractor job",
					},
				]
			: []),
		...(isTodayToBeStarted
			? [
					{
						labelId: legends.newStart,
						id: "new-start",
						description: "New start",
					},
				]
			: []),
	];

	const renderForm = () => {
		if (rowType === SCHEDULE_ROW_TYPE.QC_REPAIR) {
			return (
				<QCRepairCardForm
					setIsEditing={setIsEditing}
					isTodayToBeStarted={isTodayToBeStarted}
					mode={FORM_MODE.CREATE}
					bcewJob={bcewJob}
					rowType={rowType}
					date={date}
				/>
			);
		}
		if (rowType === SCHEDULE_ROW_TYPE.QC_INSPECTION) {
			return (
				<QcInspectionCardForm
					setIsEditing={setIsEditing}
					isTodayToBeStarted={isTodayToBeStarted}
					mode={FORM_MODE.CREATE}
					bcewJob={bcewJob}
					date={date}
				/>
			);
		}
		return (
			<NoScheduleForm
				date={date}
				setIsEditing={setIsEditing}
				bcewJob={bcewJob}
				specialJob={specialJob}
				rowType={rowType}
			/>
		);
	};

	return dayType === holidayTypes.HOLIDAY ? (
		<div className="flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-300 bg-white p-3 text-brand-dark30">
			<div className="flex h-full w-full items-center justify-center">Holiday</div>
		</div>
	) : (
		<>
			<div
				className={cn(
					"flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-300 bg-white p-3",
					cardColorClass,
					isJobHasError && isTodayToBeStarted && "border-red-500"
				)}
			>
				{!isEditing ? (
					<div className="flex h-full w-full flex-col">
						<div className="flex w-full items-center justify-between">
							{!pdf && (!isPastDate || isAllowedToModifyPastDates) && accessLevel === ACCESS_LEVEL.WRITE && (
								<Plus
									onClick={() => {
										setIsEditing(true);
									}}
									className="h-4 w-4 cursor-pointer text-brand-dark30"
								/>
							)}

							<div className="flex w-full items-center justify-end gap-1">
								{legendItems?.map((label) => {
									const Icon = statusIcons[label.labelId as JobStatus];
									const tooltipText = label.description;
									return (
										<Tooltip key={label.id}>
											<TooltipTrigger asChild>
												<div key={label.id} className="flex items-center gap-1">
													{Icon}
												</div>
											</TooltipTrigger>
											<TooltipContent side="top" align="center">
												{tooltipText}
												<TooltipArrow />
											</TooltipContent>
										</Tooltip>
									);
								})}
							</div>
						</div>

						<div className="mb-3 flex h-full w-full items-center justify-center">
							{isTodayToBeStarted ? (
								<p className="text-sm font-semibold text-brand-dark30" onClick={handleCreateDailyJob}>
									New Start
								</p>
							) : isSubContractorForecastDate ? (
								<p className="text-sm font-semibold text-brand-dark30" onClick={handleCreateDailyJob}>
									Job ends here
								</p>
							) : (
								<LuCalendarOff size={14} className="text-[20px] text-brand-dark30" onClick={handleCreateDailyJob} />
							)}
						</div>
					</div>
				) : (
					renderForm()
				)}
			</div>
			<Modal />
		</>
	);
};
export default NoScheduleCard;
