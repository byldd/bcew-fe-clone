"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import ReportTechnicalIssue from "@/module/employee-technical-issue/report-technical-bug/components/report-technical-issue";

const ReportIssueTrigger = () => {
	const { openModal, closeModal, Modal } = useModal();

	return (
		<>
			<Button
				variant="filled"
				className="h-10 w-fit"
				onClick={() =>
					openModal({
						variant: "medium",
						modalTitle: "Submit an Issue",

						modalView: <ReportTechnicalIssue onClose={closeModal} openModal={openModal} />,
					})
				}
			>
				Report Issue
			</Button>

			<Modal />
		</>
	);
};

export default ReportIssueTrigger;
