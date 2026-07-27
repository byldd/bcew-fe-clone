"use client";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { useModal } from "@/hooks/useModal";
import DeactivateUserModal from "./deactivate-user-modal";

interface Props {
	employeeId: string;
	employeeName: string;
	onConfirmDeactivate: () => void;
}

const DeactivateTrigger = ({ employeeId, employeeName, onConfirmDeactivate }: Props) => {
	const { openModal, closeModal, Modal } = useModal();

	return (
		<>
			<Button
				className="h-9"
				variant="destructive"
				onClick={() =>
					openModal({
						modalTitle: <CardTitle className="text-xl font-semibold">Deactivate User : {employeeName}</CardTitle>,
						modalView: (
							<DeactivateUserModal
								employeeId={employeeId}
								employeeName={employeeName}
								onClose={closeModal}
								onConfirmDeactivate={onConfirmDeactivate}
							/>
						),
						variant: "medium",
					})
				}
			>
				Deactivate
			</Button>
			<Modal />
		</>
	);
};

export default DeactivateTrigger;
