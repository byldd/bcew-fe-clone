"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";
import CreateTeamModal from "@/module/team/modals/create-team-modal";

const CreateNewTeamTrigger = () => {
	const { openModal, closeModal, Modal } = useModal();

	return (
		<WriteAccessWrapper>
			<Button
				variant="filled"
				className="w-fit"
				onClick={() =>
					openModal({
						variant: "medium",
						modalTitle: "Create New Team",
						modalView: <CreateTeamModal onClose={closeModal} />,
					})
				}
			>
				Create New Team
			</Button>

			<Modal />
		</WriteAccessWrapper>
	);
};

export default CreateNewTeamTrigger;
