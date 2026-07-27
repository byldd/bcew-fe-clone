import { Button } from "@/components/ui/button";
import { ISubContractorDailyJobDetailsResponse } from "@/module/sub-contractor/types";
import { IOpenModal } from "@/types";
import { SubContractorTimeLogModalContent } from "@/module/sub-contractor/components/sub-contractor-time-log-modal-content";

interface ISubContractorLogTime {
	isDisabled: boolean;
	assignedJob: ISubContractorDailyJobDetailsResponse;
	openModal: ({}: IOpenModal) => void;
	closeModal: () => void;
	refetch: () => void;
}

const SubContractorLogTime = ({ isDisabled, assignedJob, openModal, closeModal, refetch }: ISubContractorLogTime) => {
	const openTimeLogModal = () => {
		if (assignedJob && !isDisabled) {
			openModal({
				modalTitle: "Log Crew's Time for this Job",
				modalView: (
					<SubContractorTimeLogModalContent
						subContractorJobUpdates={assignedJob?.subContractorJobUpdate}
						onClose={closeModal}
						assignedJob={assignedJob}
						refetch={refetch}
					/>
				),
				variant: "default",
				showDefaultClose: true,
			});
		}
	};
	return (
		<Button disabled={isDisabled} onClick={() => openTimeLogModal()} variant="filled" className="w-full">
			Log time
		</Button>
	);
};

export default SubContractorLogTime;
