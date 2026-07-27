"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import AddTeamMembersModal from "@/module/team/modals/add-team-members-modal";
import { ITeamDetails } from "@/module/team/types";

interface Props {
	team: ITeamDetails;
}

export default function AddTeamMembersTrigger({ team }: Props) {
	const { openModal, closeModal, Modal } = useModal();

	return (
		<>
			<Modal />

			<Button
				variant="filled"
				onClick={() =>
					openModal({
						modalTitle: "Add Members",
						variant: "medium",
						modalView: <AddTeamMembersModal team={team} onClose={closeModal} />,
					})
				}
			>
				Add Members
			</Button>
		</>
	);
}
