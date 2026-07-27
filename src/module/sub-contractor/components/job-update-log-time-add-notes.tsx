import { JobNotesCard } from "@/module/job/components/job-notes-card";
import { ISubContractorDailyJobDetailsResponse } from "@/module/sub-contractor/types";
import { IOpenModal } from "@/types";
import { Button } from "@/components/ui/button";
import { IAuthStore } from "@/module/profile/types";
import SubContractorDailyJobAddNoteModalContent from "@/module/sub-contractor/components/sub-contractor-daily-job-note-modal";
import SubContractorJobUpdateForm from "@/module/sub-contractor/components/sub-contractor-daily-job-update-modal";
import { SubContractorJobUpdatesCard } from "@/module/sub-contractor/components/sub-contractor-job-updates-card";
import { SubContractorJobOverviewCard } from "@/module/sub-contractor/components/sub-contractor-job-overview.card";
import { handleSubContractorPastFutureDateOperations, isJobNewStart } from "@/module/job/utils";
import { getTodayDate } from "@/lib/utils/date";
import JobNewStartModal from "@/module/employee-dashboard/components/new-start-modal/job-new-start-modal";
import { NewStartCard } from "@/module/job/components/new-start-card";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { SubcontractorQuickActions } from "@/module/sub-contractor/components/subcontractor-quick-actions";
interface IJobUpdateLogTimeAddNotesProps {
	openModal: ({}: IOpenModal) => void;
	closeModal: () => void;
	refetch: () => void;
	assignedJob: ISubContractorDailyJobDetailsResponse;
	subContractorType: IAuthStore;
}

export const JobUpdateLogTimeAddNotes = ({
	openModal,
	closeModal,
	refetch,
	assignedJob,
	subContractorType,
}: IJobUpdateLogTimeAddNotesProps) => {
	// TODO: Temporarily hidden; will be permanently removed after client final confirmation.
	// const dayTime = {
	// 	dayStartTime: assignedJob?.subContractorJobUpdate?.startTime,
	// 	dayEndTime: assignedJob?.subContractorJobUpdate?.endTime,
	// };

	const isPastOrFutureDate = handleSubContractorPastFutureDateOperations(assignedJob?.date, getTodayDate());

	const isNewStartJob = isJobNewStart(assignedJob?.jobLabelAssignments, assignedJob?.notReadyUpdate?.isReady);

	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const isCrewLeaderOwnJob =
		subContractorType &&
		subContractorType?.subcontractorCrew &&
		subContractorType?.subcontractorCrew?.id === assignedJob?.subcontractorCrew?.id
			? true
			: false;

	const isAdmin = subContractorType && subContractorType?.user?.id;

	const handleClose = () => {
		closeModal();
		refetch();
	};

	const openAddNoteModal = ({
		userId,
		jobDailyRecordId,
		onSave,
	}: {
		userId: string | undefined;
		jobDailyRecordId: string | undefined;
		onSave: () => void;
	}) => {
		openModal({
			modalTitle: tEmployee.addNewNote,
			modalView: (
				<SubContractorDailyJobAddNoteModalContent
					userId={userId}
					jobDailyRecordId={jobDailyRecordId}
					onSave={onSave}
					subContractorType={subContractorType}
				/>
			),
			variant: "default",
			showDefaultClose: true,
		});
	};

	const openJobUpdateModal = () => {
		if (isNewStartJob && !assignedJob?.notReadyUpdate) {
			handleEditButtonClick();
			return;
		}

		if (assignedJob && !isPastOrFutureDate && (isAdmin || isCrewLeaderOwnJob)) {
			openModal({
				modalTitle: tEmployee.jobUpdates,
				subHeader: (
					<span className="pt-2 font-inter text-sm font-medium text-brand-dark50">
						{tEmployee.answerQuestionsToCompleteJob}
					</span>
				),
				modalView: (
					<SubContractorJobUpdateForm
						job={assignedJob}
						onUpdate={refetch}
						onClose={closeModal}
						subContractorType={subContractorType}
					/>
				),
				variant: "default",
				showDefaultClose: true,
			});
		}
	};

	const handleEditButtonClick = () => {
		if (assignedJob && !isPastOrFutureDate) {
			openModal({
				variant: "medium",
				modalTitle: (
					<div className="mb-2">
						<div>
							{tEmployee.job}#{assignedJob.actrec?.recnum}
							<span className="ml-2">{`(${assignedJob?.schlin?.tsknme || assignedJob?.qcJob?.schlin?.tsknme || `${assignedJob?.srvinv?.typnme?.split(" ")[0]} - ${assignedJob?.srvinv?.ordnum}`})`}</span>
							<span className="ml-4 inline-block h-3 w-3 rounded-full bg-brand-greenAccent"></span>
						</div>
						<div>
							<span className="text-sm font-semibold text-brand-dark50">{tEmployee.newStartJob}</span>
						</div>
					</div>
				),
				subHeader: tEmployee.updateCrewFieldsNotification,

				modalView: <JobNewStartModal onClose={handleClose} dailyJob={assignedJob} />,
			});
		}
	};

	const crew = assignedJob?.subcontractorCrew;

	return (
		<div className="relative h-full">
			<SubcontractorQuickActions jobDailyRecordId={assignedJob.id} isAdmin={!!isAdmin} />
			<div className="h-full overflow-y-auto px-4 pb-24">
				<SubContractorJobOverviewCard jobData={assignedJob} />

				{
					<div className="my-4 rounded-[10px] border py-4">
						{/* TODO: Temporarily hidden; will be permanently removed after client final confirmation. */}
						{/* {dayTime?.dayStartTime && dayTime?.dayEndTime ? (
						<div className="flex justify-between px-4 text-sm font-medium text-brand-dark">
							<span>Day Start: {toFormattedDate(dayTime.dayStartTime, DATE_FORMAT.HH_MM_AA_PM)}</span>
							<span>Day End: {toFormattedDate(dayTime.dayEndTime, DATE_FORMAT.HH_MM_AA_PM)}</span>
						</div>
					) : null} */}

						<div className="mt-2 border-b pb-2 text-center text-sm font-medium text-brand-dark60">
							{tEmployee.members}
						</div>

						{
							<div className="mt-4 flex flex-col items-center gap-3">
								<div className="font-inter text-xs font-medium text-brand-dark">
									{crew?.crewLeaderName ? `${crew?.crewLeaderName} (Crew Leader)` : "No crew assigned"}
								</div>
								{crew?.crewEmployees?.map((emp) => (
									<div key={emp?.id} className="font-inter text-xs font-medium text-brand-dark">
										{emp?.name}
									</div>
								))}
							</div>
						}
					</div>
				}

				<div className="my-2">
					<JobNotesCard
						notes={assignedJob?.notes}
						isAddNoteAllowed={!isPastOrFutureDate && (!!isAdmin || !!isCrewLeaderOwnJob)}
						openAddNoteModal={() =>
							openAddNoteModal({
								userId: assignedJob?.subcontractor?.user?.id,
								jobDailyRecordId: assignedJob?.id,
								onSave: handleClose,
							})
						}
					/>
				</div>

				{isNewStartJob && (
					<NewStartCard
						notReadyUpdate={assignedJob?.notReadyUpdate}
						handleEditButtonClick={handleEditButtonClick}
						isDisabled={isAdmin || isCrewLeaderOwnJob ? false : true}
					/>
				)}

				<SubContractorJobUpdatesCard
					jobData={assignedJob}
					handleEditButtonClick={openJobUpdateModal}
					isEditAllowed={!isPastOrFutureDate && (!!isAdmin || !!isCrewLeaderOwnJob)}
				/>
			</div>

			<div aria-disabled={true} className="fixed bottom-0 left-0 right-0 z-50 flex space-x-3 bg-white px-4 py-4">
				<Button
					disabled={isPastOrFutureDate || assignedJob?.isJobFinishToday || !(isAdmin || isCrewLeaderOwnJob)}
					variant="filled"
					onClick={openJobUpdateModal}
					className="w-full"
				>
					{assignedJob?.isJobFinishToday ? tEmployee.completed : tEmployee.jobUpdatesTitle}
				</Button>
				{/* TODO: Temporarily hidden; will be permanently removed after client final confirmation. */}
				{/* <SubContractorLogTime
					isDisabled={
						!(
							(isAdmin || isCrewLeaderOwnJob) &&
							(!isPastDate || (isPastDate && !dayTime?.dayStartTime && !dayTime?.dayEndTime))
						)
					}
					assignedJob={assignedJob}
					openModal={openModal}
					closeModal={closeModal}
					refetch={refetch}
				/> */}
			</div>
		</div>
	);
};
