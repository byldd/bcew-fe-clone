"use client";

import { History } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import { AppTooltip } from "@/components/ui/tooltip";
import MaterialRequestAuditModal from "./material-request-audit-modal";

export default function MaterialRequestHistoryButton({ requestId }: { requestId?: number | string | null }) {
	const { openModal, Modal } = useModal();

	const hasRequestId = requestId !== null && requestId !== undefined && `${requestId}`.length > 0;

	if (!hasRequestId) {
		return null;
	}

	const openHistoryModal = () => {
		openModal({
			modalTitle: "Audit Trail & History",
			showDefaultClose: true,
			variant: "default",
			modalView: <MaterialRequestAuditModal requestId={requestId as number | string} />,
		});
	};

	return (
		<>
			<AppTooltip
				text="Audit trail & history"
				trigger={
					<button
						type="button"
						onClick={openHistoryModal}
						aria-label="View audit trail & history"
						className="text-brand-dark50 transition-colors hover:text-brand-dark"
					>
						<History className="h-3.5 w-3.5" />
					</button>
				}
			/>
			<Modal />
		</>
	);
}
