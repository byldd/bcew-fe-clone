"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { IAttendancePendingApproval } from "../types";
import AttendanceReviewModal from "./attendance-review-modal";

const AttendanceReviewAction = ({ approval }: { approval: IAttendancePendingApproval }) => {
	const { Modal, openModal, closeModal } = useModal();

	return (
		<>
			<Button
				type="button"
				variant="filled"
				size="sm"
				onClick={() =>
					openModal({
						modalTitle: `Review ${approval.requestId}`,
						modalView: <AttendanceReviewModal approval={approval} onClose={closeModal} />,
					})
				}
			>
				Review
			</Button>
			<Modal />
		</>
	);
};

export default AttendanceReviewAction;
