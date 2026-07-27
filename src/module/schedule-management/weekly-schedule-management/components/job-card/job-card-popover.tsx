import { useModal } from "@/hooks/useModal";
import React from "react";
import {
	IWeekScheduleResponse,
	QC_JOB_TYPE,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import DeleteJobModal from "@/module/schedule-management/weekly-schedule-management/modals/delete-job-modal";
import MarkJobAsNotReadyModal from "@/module/schedule-management/weekly-schedule-management/modals/not-ready-job-modal";
import JobPopoverItem from "@/module/schedule-management/weekly-schedule-management/components/job-popover-item";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import { EditJobModal } from "@/module/schedule-management/weekly-schedule-management/modals/edit-job-modal";
import { JOB_PHASE_LABEL, SCHEDULE_ROW_TYPE, SCHEDULE_ROW_TYPE_LABEL } from "../../constants/week-schedule";
import { CreateQcRepairModal } from "../../modals/qc-job/create-qc-repair-modal";
import { FORM_MODE } from "@/types";
import { QcInspectionJobModal } from "../../modals/qc-job/qc-inspection-job-modal";
import SpcialJobModal from "../../modals/special-job/special-job-modal";
import { getTodayDate } from "@/lib/utils/date";
import { useScheduleContext } from "../../context/schedule-context";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const JobCardPopover = ({
	dailyJobWithEmployee,
	onClose,
	bcewJob,
	date,
	specialJob,
}: {
	bcewJob?: IWeekScheduleResponse["bcewJobs"][number];
	specialJob?: IWeekScheduleResponse["specialJobs"][number];
	date: Date;
	dailyJobWithEmployee: IWeekScheduleResponse["dailyJobs"][number];
	onClose: () => void;
	rowType: SCHEDULE_ROW_TYPE;
}) => {
	const { openModal, closeModal, Modal } = useModal(onClose);
	const { isAllowedToModifyPastDates } = useScheduleContext();
	const isPastDate = new Date(date) < getTodayDate();
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const handleClose = () => {
		onClose();
		closeModal();
	};

	const jobTitle = dailyJobWithEmployee?.specialJob
		? dailyJobWithEmployee?.specialJob?.name
		: bcewJob?.schlin?.actrec.jobnme || bcewJob?.srvinv?.actrec.jobnme || bcewJob?.schlinExtended?.actrec.jobnme;

	const jobPhase =
		bcewJob?.schlin?.tsknme ||
		bcewJob?.srvinv?.ordnum ||
		(bcewJob?.schlinExtended?.tsknum
			? `${JOB_PHASE_LABEL[bcewJob?.schlinExtended?.tsknum]} ${dailyJobWithEmployee?.qcType === QC_JOB_TYPE.REPAIR ? SCHEDULE_ROW_TYPE_LABEL.QC_REPAIR : SCHEDULE_ROW_TYPE_LABEL.QC_INSPECTION}`
			: "");

	const handleEditJob = () => {
		if (dailyJobWithEmployee.isQcJob && bcewJob) {
			const title = (
				<p>
					{bcewJob?.schlin?.actrec.jobnme || bcewJob?.srvinv?.actrec.jobnme || bcewJob?.schlinExtended?.actrec.jobnme} (
					{bcewJob?.schlin?.tsknme ||
						bcewJob?.srvinv?.ordnum ||
						(bcewJob?.schlinExtended?.tsknum
							? `${JOB_PHASE_LABEL[bcewJob?.schlinExtended?.tsknum]} ${dailyJobWithEmployee?.qcType === QC_JOB_TYPE.REPAIR ? SCHEDULE_ROW_TYPE_LABEL.QC_REPAIR : SCHEDULE_ROW_TYPE_LABEL.QC_INSPECTION}`
							: "")}
					)
				</p>
			);
			if (dailyJobWithEmployee?.qcType === QC_JOB_TYPE.REPAIR) {
				openModal({
					modalTitle: title,
					modalView: (
						<CreateQcRepairModal closeModal={handleClose} mode={FORM_MODE.EDIT} dailyJobId={dailyJobWithEmployee.id} />
					),
					variant: "medium",
				});
			} else {
				openModal({
					modalTitle: title,
					modalView: (
						<QcInspectionJobModal closeModal={handleClose} mode={FORM_MODE.EDIT} dailyJobId={dailyJobWithEmployee.id} />
					),
					variant: "medium",
				});
			}
		} else if (dailyJobWithEmployee.specialJobId && specialJob) {
			openModal({
				modalTitle: <p className="capitalize">{dailyJobWithEmployee.specialJob?.name}</p>,
				modalView: (
					<SpcialJobModal
						closeModal={handleClose}
						mode={FORM_MODE.EDIT}
						dailyJobId={dailyJobWithEmployee.id}
						specialJob={specialJob}
					/>
				),
				variant: "medium",
			});
		} else {
			openModal({
				modalTitle: (
					<p>
						{bcewJob?.schlin?.actrec.jobnme || bcewJob?.srvinv?.actrec.jobnme} (
						{bcewJob?.schlin?.tsknme || bcewJob?.srvinv?.ordnum})
					</p>
				),

				modalView: <EditJobModal dailyJobId={dailyJobWithEmployee.id} closeModal={handleClose} />,
				variant: "medium",
			});
		}
	};

	return (
		<div className="fixed right-[-10] top-36 z-50 flex w-[166px] flex-col overflow-hidden rounded-[10px] bg-white text-center shadow-[-4px_4px_12px_0px_#21212140]">
			<Modal />
			<JobPopoverItem
				label={isPastDate && !isAllowedToModifyPastDates ? tCommon.viewJob : tCommon.editJob}
				onClick={handleEditJob}
				className="text-brand-dark hover:bg-gray-100"
			/>

			{!isPastDate &&
				!dailyJobWithEmployee.isQcJob &&
				!dailyJobWithEmployee.specialJobId &&
				dailyJobWithEmployee.jobLabelAssignments?.find((label) => label.labelId === legends.newStart) && (
					<JobPopoverItem
						label={tCommon.markAsNotReady}
						onClick={() =>
							openModal({
								variant: "medium",
								modalTitle: (
									<div className="mb-2">
										<div>
											{tEmployee.job}#{bcewJob?.schlin?.recnum || bcewJob?.srvinv?.recnum}
											<span className="ml-2">{`(${bcewJob?.schlin?.tsknme || bcewJob?.srvinv?.ordnum})`}</span>
											<span className="ml-4 inline-block h-3 w-3 rounded-full bg-brand-greenAccent"></span>
										</div>
										<div>
											<span className="text-sm font-semibold text-brand-dark50">{tCommon.newStartJob}</span>
										</div>
									</div>
								),
								subHeader: tEmployee.updateCrewFieldsNotification,
								modalView: <MarkJobAsNotReadyModal onClose={handleClose} dailyJob={dailyJobWithEmployee} />,
							})
						}
						className="text-brand-dark hover:bg-gray-100"
					/>
				)}

			{!isPastDate && (
				<JobPopoverItem
					label={tCommon.deleteJob}
					onClick={() =>
						openModal({
							modalView: <DeleteJobModal dailyJobId={dailyJobWithEmployee.id} onClose={handleClose} />,
							modalTitle: (
								<p>
									{tCommon.deleteJob} {jobTitle} {jobPhase && `(${jobPhase})`}
								</p>
							),
							variant: "medium",
							subHeader:
								"By deleting this job, all the schedule related to this job will get canceled. You can send a customized message to all the members who are assigned to this job and let them know about the cancellation.",
						})
					}
					className="text-red-500 hover:bg-red-100"
				/>
			)}
		</div>
	);
};

export default JobCardPopover;
