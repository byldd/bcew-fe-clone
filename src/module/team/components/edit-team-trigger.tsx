"use client";

import { FiEdit } from "react-icons/fi";
import { useModal } from "@/hooks/useModal";
import { ITeam } from "@/module/team/types";
import EditTeamModal from "../modals/edit-team-modal";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";
interface Props {
	team: ITeam;
}

const EditTeamTrigger = ({ team }: Props) => {
	const { openModal, closeModal, Modal } = useModal();

	return (
		<WriteAccessWrapper>
			<Modal />

			<div className="flex items-center justify-center">
				<FiEdit
					className="cursor-pointer text-lg"
					onClick={() => {
						openModal({
							modalTitle: `Edit Team (${team.name})`,

							variant: "medium",
							modalView: <EditTeamModal team={team} onClose={closeModal} />,
						});
					}}
				/>
			</div>
		</WriteAccessWrapper>
	);
};

export default EditTeamTrigger;
