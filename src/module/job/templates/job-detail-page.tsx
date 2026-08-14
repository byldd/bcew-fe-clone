"use client";

import { useRouter } from "next/navigation";
import { useEmployeeDailyJob, useGetEmployeeData } from "../hooks/useEmployeeSchedule";
import { useModal } from "@/hooks/useModal";
import { handlePastFutureDateOperations, isBoolean, isJobNewStart } from "../utils";
import { TimeLogModalContent } from "../components/time-log-modal-content";
import { JobHeader } from "../components/job-header";
import { JobSummarySection } from "../components/job-summary-section";
import { JobNotesSection } from "../components/job-notes-section";
import { JobUpdatesSection } from "../components/job-updates-section";
import { JobMaterialsSection } from "../components/job-materials-section";
import JobNewStartModal from "@/module/employee-dashboard/components/new-start-modal/job-new-start-modal";
import { useEmployeeScheduleParams } from "../hooks/useEmployeeScheduleParams";
import { openErrorToast } from "@/components/toast";
import { dateToUTCString } from "@/lib/utils/date";
import { Spinner } from "@/components/ui/spinner";
import RescheduleModal from "@/module/employee-dashboard/components/reschedule-modal";
import JobUpdateForm from "../components/job-update-modal/job-update-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { JobDetailFooterActions } from "../components/job-detail-footer-actions";
import { getEmployeeAssignmentForJob, isEditDisabledForJob, shouldShowRescheduleAction } from "../utils/job-detail";
import { JobQuickActions } from "../components/job-quick-actions";
import {
	JOB_PHASE_LABEL,
	SCHEDULE_ROW_TYPE_LABEL,
} from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";
import { QC_JOB_TYPE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export function JobDetailPage({ assignmentId }: { assignmentId: string }) {
	const router = useRouter();
	const { openModal, closeModal, Modal } = useModal();
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();

	const { data: jobData, refetch, isLoading, isRefetching } = useEmployeeDailyJob(assignmentId);

	const { data: userData } = useGetEmployeeData(dateToUTCString(jobData?.date || startDate));
	const { employee, isMaterialRequestAllowed, isCrateHandlerAllowed, isFingerprintEnabled } = userData || {};
	const employeeDayTime = employee?.employeeDayTimes?.[0];

	const { schedule, jobEmployeeAssignments, notes, jobLabelAssignments, notReadyUpdate, specialJob } = jobData || {};
	const employeeId = userData?.employee?.id;
	const { actrec } = schedule || {};

	const employeeAssignment = jobEmployeeAssignments?.find((jobEmployee) => jobEmployee.employeeId === employeeId);

	const isReadOnly = !employeeAssignment?.id;

	const jobName = jobData?.specialJob ? jobData.specialJob.name : actrec?.jobnme;
	const jobAddress = [actrec?.addrs1, actrec?.addrs2, actrec?.ctynme, actrec?.state_, actrec?.zipcde]
		.filter(Boolean)
		.join(", ");
	const qcType = jobData?.qcType;
	const qcJobType = qcType
		? `${qcType === QC_JOB_TYPE.REPAIR ? SCHEDULE_ROW_TYPE_LABEL.QC_REPAIR : SCHEDULE_ROW_TYPE_LABEL.QC_INSPECTION}`
		: null;
	const jobPhase = schedule?.weeklySchedulesSrvinv
		? `${schedule.weeklySchedulesSrvinv.split(" ")[0]} - ${schedule?.tsknme ?? ""}`
		: jobData?.isQcJob
			? `(${JOB_PHASE_LABEL[Number(schedule?.tsknum)]})${qcJobType ? ` (${qcJobType})` : ""}`
			: schedule?.tsknme;

	const handleYouTag = (jobEmployeeId: string | undefined) => {
		return jobEmployeeId === employeeAssignment?.employee?.id;
	};

	const handleTaskLeader = (jobEmployeeId: string | undefined) => {
		return jobEmployeeId === jobData?.taskLeaderId;
	};

	const isTaskLeader = employeeId === jobData?.taskLeaderId && !isReadOnly;

	const handleClose = () => {
		refetch();
		closeModal();
	};

	const isQcInspectionToday = shouldShowRescheduleAction(jobData);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const openTimeLogModalView = (currentJob = jobData, currentAssignment = employeeAssignment) => {
		if (currentAssignment && currentJob?.date)
			openModal({
				modalTitle: tEmployee.logYourTimeForThisJob,
				subHeader: currentAssignment?.didNotWorked ? tEmployee.markedJobDidNotWork : "",
				modalView: (
					<TimeLogModalContent
						onClose={closeModal}
						user={currentAssignment}
						jobId={assignmentId}
						jobDate={currentJob?.date}
					/>
				),
				variant: "default",
				showDefaultClose: true,
			});
	};

	const handleEditButtonClick = ({
		fromTimeLogFlow = false,
		currentJob,
	}: {
		fromTimeLogFlow?: boolean;
		currentJob?: typeof jobData;
	} = {}) => {
		const selectedJob = currentJob ?? jobData;
		const selectedAssignment = getEmployeeAssignmentForJob(selectedJob, employeeId);

		if (
			isEditDisabledForJob({
				currentJob: selectedJob,
				currentAssignment: selectedAssignment,
				startDate,
				dayEndTime: employeeDayTime?.dayEndTime,
			})
		) {
			return;
		}
		if (selectedJob) {
			const jobUpdateData = {
				id: selectedJob.id,
				notReadyUpdate: selectedJob.notReadyUpdate,
				images: selectedJob.images,
				jobLabelAssignments: selectedJob.jobLabelAssignments,
				recunum: selectedJob.schedule?.recnum,
			};
			openModal({
				variant: "medium",
				modalTitle: (
					<div className="mb-2">
						<div>
							Job&nbsp;#
							{selectedJob.schedule?.recnum}
							<span className="ml-2">{`(${selectedJob.schedule?.tsknme})`}</span>
							<span className="ml-4 inline-block h-3 w-3 rounded-full bg-brand-greenAccent"></span>
						</div>
						<div>
							<span className="text-sm font-semibold text-brand-dark50">{tEmployee.newStartJob}</span>
						</div>
					</div>
				),
				subHeader: tEmployee.updateCrewFieldsNotification,

				modalView: (
					<JobNewStartModal
						onClose={fromTimeLogFlow ? closeModal : handleClose}
						onSubmitSuccess={fromTimeLogFlow ? continueTimeLogFlow : undefined}
						dailyJob={jobUpdateData}
						didNotWork={selectedAssignment?.didNotWorked ? true : false}
						assignmentId={selectedAssignment?.id}
					/>
				),
			});
		}
	};

	const handleJobUpdateButtonClick = ({
		fromTimeLogFlow = false,
		currentJob,
	}: {
		fromTimeLogFlow?: boolean;
		currentJob?: typeof jobData;
	} = {}) => {
		const selectedJob = currentJob ?? jobData;
		const selectedAssignment = getEmployeeAssignmentForJob(selectedJob, employeeId);

		if (
			isEditDisabledForJob({
				currentJob: selectedJob,
				currentAssignment: selectedAssignment,
				startDate,
				dayEndTime: employeeDayTime?.dayEndTime,
			})
		) {
			return;
		}
		if (selectedJob) {
			openModal({
				modalTitle: tEmployee.jobUpdates,
				subHeader: <span className="font-medium">{tEmployee.answerQuestionsToCompleteJob}</span>,
				modalView: (
					<JobUpdateForm
						job={selectedJob}
						onClose={closeModal}
						onSubmitSuccess={fromTimeLogFlow ? continueTimeLogFlow : undefined}
					/>
				),
				variant: "default",
				showDefaultClose: true,
			});
		}
	};

	const continueTimeLogFlow = async () => {
		const { data: latestJob } = await refetch();

		if (!latestJob) {
			return;
		}

		openTimeLogModal({
			currentJob: latestJob,
			fromTimeLogFlow: true,
		});
	};

	const handleNoteSave = () => {
		refetch();
	};

	const openTimeLogModal = ({
		currentJob,
		fromTimeLogFlow = false,
	}: {
		currentJob?: typeof jobData;
		fromTimeLogFlow?: boolean;
	} = {}) => {
		const selectedJob = currentJob ?? jobData;
		const selectedAssignment = getEmployeeAssignmentForJob(selectedJob, assignmentId);
		const selectedIsTaskLeader = employeeId === selectedJob?.taskLeaderId;
		const selectedJobNewStart = isJobNewStart(selectedJob?.jobLabelAssignments, selectedJob?.notReadyUpdate?.isReady);

		if (selectedJobNewStart && !isBoolean(selectedJob?.notReadyUpdate?.isReady)) {
			if (!fromTimeLogFlow) {
				openErrorToast({ message: tEmployee.provideJobStatusBeforeTimeLogs });
			}
			return handleEditButtonClick({
				fromTimeLogFlow: true,
				currentJob: selectedJob,
			});
		}
		if (selectedIsTaskLeader && !isBoolean(selectedJob?.isJobFinishToday)) {
			if (!fromTimeLogFlow) {
				openErrorToast({ message: tEmployee.logJobUpdatesBeforeTimeLogs });
			}
			return handleJobUpdateButtonClick({
				fromTimeLogFlow: true,
				currentJob: selectedJob,
			});
		}

		if (
			!isEditDisabledForJob({
				currentJob: selectedJob,
				currentAssignment: selectedAssignment,
				startDate,
				dayEndTime: employeeDayTime?.dayEndTime,
			})
		) {
			openTimeLogModalView(selectedJob, selectedAssignment);
		}
	};

	const isAddNoteAllowed = !handlePastFutureDateOperations(
		jobData?.date,
		startDate,
		employeeDayTime?.dayEndTime,
		!employeeAssignment?.startTime,
		false
	);

	const openRescheduleModal = () => {
		if (!jobData?.id) {
			return;
		}
		openModal({
			modalTitle: `Reschedule Job ${actrec?.jobnme}`,
			modalView: <RescheduleModal onClose={closeModal} dailyJobId={jobData?.id} />,
		});
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!jobData?.id) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p>Job not found</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen overflow-y-auto bg-brand-bgLightgrey">
			<div className="space-y-3 px-4 pb-28">
				<JobHeader
					actrec={actrec}
					onBack={() => router.back()}
					user={employeeAssignment}
					openModal={openModal}
					closeModal={closeModal}
					jobLabelAssignments={jobLabelAssignments}
					specialJob={specialJob}
				/>

				{(isMaterialRequestAllowed || isCrateHandlerAllowed) && !jobData?.specialJob && (
					<JobQuickActions
						assignmentId={assignmentId}
						recnum={jobData?.schedule?.recnum ?? null}
						tsknum={jobData?.schedule?.tsknum ?? null}
						isMaterialRequestAllowed={isMaterialRequestAllowed}
						isCrateHandlerAllowed={isCrateHandlerAllowed}
					/>
				)}

				<JobSummarySection
					jobName={jobName}
					jobPhase={jobPhase}
					jobAddress={jobAddress}
					jobData={jobData}
					employeeAssignment={employeeAssignment}
					jobEmployeeAssignments={jobEmployeeAssignments}
					handleYouTag={handleYouTag}
					handleTaskLeader={handleTaskLeader}
					projectGpsData={jobData?.projectGpsData}
				/>

				<JobNotesSection
					notes={notes}
					userId={employeeAssignment?.employee?.id}
					jobDailyRecordId={jobData?.id}
					isAddNoteAllowed={isAddNoteAllowed}
					onNoteAdded={handleNoteSave}
				/>

				<JobUpdatesSection
					jobData={jobData}
					notReadyUpdate={notReadyUpdate}
					isTaskLeader={isTaskLeader}
					onNewStartEdit={handleEditButtonClick}
					onJobUpdateEdit={handleJobUpdateButtonClick}
				/>

				{!jobData?.specialJob && <JobMaterialsSection assignmentId={assignmentId} />}

				{!isReadOnly && (
					<JobDetailFooterActions
						isTaskLeader={isTaskLeader}
						isJobFinishToday={jobData?.isJobFinishToday}
						isSpecialJob={jobData?.specialJob ? true : false}
						isLoading={isLoading}
						isRefetching={isRefetching}
						hasJobId={Boolean(jobData?.id)}
						hasEmployeeStartTime={Boolean(employeeAssignment?.startTime)}
						showRescheduleAction={isQcInspectionToday}
						isFingerprintEnabled={isFingerprintEnabled}
						onJobUpdateClick={() => handleJobUpdateButtonClick()}
						onTimeLogClick={() => openTimeLogModal()}
						onRescheduleClick={openRescheduleModal}
						labels={{
							completed: tEmployee.completed,
							jobUpdatesTitle: tEmployee.jobUpdatesTitle,
							notCompleted: tEmployee.notCompleted,
							updateLogTime: tEmployee.updateLogTime,
							logTime: tEmployee.logTime,
							reschedule: tEmployee.reschedule,
						}}
					/>
				)}
			</div>
			<Modal />
		</div>
	);
}
