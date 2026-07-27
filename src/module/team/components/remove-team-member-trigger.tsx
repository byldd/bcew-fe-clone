"use client";

import { useModal } from "@/hooks/useModal";
import RemoveTeamMemberModal from "@/module/team/modals/remove-team-member-modal";
import { SlTrash } from "react-icons/sl";

interface Props {
	userId: string;
	userName: string;
	currentTeamId: string;
}

export default function RemoveTeamMemberTrigger({ userId, userName, currentTeamId }: Props) {
	const { openModal, closeModal, Modal } = useModal();

	return (
		<>
			<Modal />

			<SlTrash
				size={22}
				className="cursor-pointer p-1 text-brand-red"
				onClick={(e) => {
					e.stopPropagation();

					openModal({
						modalTitle: "Remove Member",
						variant: "medium",

						modalView: (
							<RemoveTeamMemberModal
								userId={userId}
								userName={userName}
								currentTeamId={currentTeamId}
								onClose={closeModal}
							/>
						),
					});
				}}
			/>
		</>
	);
}
