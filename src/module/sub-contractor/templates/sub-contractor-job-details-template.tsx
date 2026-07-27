"use client";

import { useModal } from "@/hooks/useModal";
import { AssignCrew } from "@/module/sub-contractor/components/assign-crew";
import { JobUpdateLogTimeAddNotes } from "@/module/sub-contractor/components/job-update-log-time-add-notes";
import {
	useAssignSubContractorCrew,
	useSubContractorDailyJobDetails,
} from "@/module/sub-contractor/hooks/useSubContractorJobSchedule";
import { AssignCrewModal } from "@/module/sub-contractor/components/assign-crew-modal";
import { SubContractorJobHeader } from "@/module/sub-contractor/components/sub-contractor-job-header";
import { useRouter } from "next/navigation";
import CreateCrewForm from "@/module/sub-contractor/components/create-crew-form";
import { Spinner } from "@/components/ui/spinner";
import ErrorMessageComponent from "@/components/get-error-message";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import useAuthStore from "@/store/auth-store";
import { handlePastDateOperations } from "@/utils";
import { getTodayDate } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface ISubcontractorJobDetailsProps {
	dailyJobId: string;
}

export const SubContractorJobDetailsTemplate = ({ dailyJobId }: ISubcontractorJobDetailsProps) => {
	const router = useRouter();
	const { openModal, closeModal, Modal } = useModal();
	const subContractorType = useAuthStore((state) => state);
	const { user, subcontractorCrew } = subContractorType;

	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	const { data, isPending, isError, error, refetch } = useSubContractorDailyJobDetails(
		dailyJobId,
		user,
		subcontractorCrew
	);

	const isPastDate = handlePastDateOperations(data?.date, getTodayDate());
	const isJobTimeLogAvailable =
		data?.subContractorJobUpdate?.startTime && data?.subContractorJobUpdate?.endTime ? true : false;

	const assignCrewMutation = useAssignSubContractorCrew();
	const queryClient = useQueryClient();

	const handleAssign = (crewId: string) => {
		if (!crewId || !dailyJobId || isJobTimeLogAvailable) return;

		assignCrewMutation.mutate(
			{ crewId, dailyJobId },
			{
				onSuccess: (res) => {
					queryClient.invalidateQueries({
						queryKey: ["subContractorDailyJobDetails"],
					});
					openSuccessToast(
						<span>
							{tSub.crew}
							<span className="font-medium">{res?.name}</span> {tSub.assignedSuccessfully}
						</span>
					);
					closeModal();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const handleOpenCreateSubContractorCrewModal = () => {
		openModal({
			modalTitle: tSub.createNewCrew,
			modalView: <CreateCrewForm onClose={closeModal} afterCreate={handleAssign} />,
		});
	};

	const handleAssignCrew = () => {
		openModal({
			modalTitle: tSub.assignCrew,
			subHeader: tSub.selectCrewInstruction,
			modalView: (
				<AssignCrewModal
					alreadyAssignedCrew={data?.subcontractorCrew?.id}
					handleOpenCreateSubContractorCrewModal={handleOpenCreateSubContractorCrewModal}
					handleAssignDailyJobCrew={handleAssign}
				/>
			),
		});
	};

	const hasAssignedCrew = !!data?.subcontractorCrew?.id;

	if (isPending || !data) return <Spinner />;
	if (isError) return ErrorMessageComponent({ error });

	return (
		<div>
			<Modal />
			{data?.actrec && data?.subcontractor && data?.jobLabelAssignments && (
				<SubContractorJobHeader
					taskJobInfo={data?.actrec}
					subContractor={data?.subcontractor}
					jobLabelAssignments={data?.jobLabelAssignments}
					isJobTimeLogAvailable={isJobTimeLogAvailable}
					isPastDate={isPastDate}
					onBack={() => router.back()}
					handleAssignCrew={handleAssignCrew}
					hasAssignedCrew={hasAssignedCrew}
				/>
			)}
			<JobUpdateLogTimeAddNotes
				openModal={openModal}
				closeModal={closeModal}
				refetch={refetch}
				assignedJob={data}
				subContractorType={subContractorType}
			/>
		</div>
	);
};
