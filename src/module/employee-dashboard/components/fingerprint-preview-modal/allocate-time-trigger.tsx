import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { AllocateTimeModal } from "@/module/matching-finger/components/allocate-time-modal";
import useAuthStore from "@/store/auth-store";
import React from "react";

const AllocateTimeTrigger = ({ date }: { date: string | Date }) => {
	const { openModal, closeModal, Modal } = useModal();
	const { user } = useAuthStore((state) => state);

	if (!user || !user?.employee) {
		return null;
	}

	const onClick = () => {
		openModal({
			modalView: (
				<AllocateTimeModal
					technicianName={user?.name}
					date={date}
					employeeId={user?.employee?.id || ""}
					onClose={closeModal}
				/>
			),
			modalTitle: "Allocate Time",
		});
	};
	return (
		<div>
			<Modal />
			<Button onClick={onClick} variant={"filled"}>
				Allocate Time
			</Button>
		</div>
	);
};

export default AllocateTimeTrigger;
