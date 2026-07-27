"use client";

import { useMemo } from "react";
import MaterialRequestsTemplate from "./material-requests/templates/material-requests-template";
import {
	useAdminMissingItemRequests,
	useUpdateMissingItemForemanNote,
} from "./missing-item-requests-admin/hooks/useAdminMissingItemRequests";
import { useModal } from "@/hooks/useModal";
import ForemanNoteModal from "./missing-item-requests-admin/components/foreman-note-modal";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { mapMissingItemToRow } from "./material-requests/utils/map-missing-item-to-row";
import type { MaterialRequestRow } from "./material-requests/utils/types";
import useAuthStore from "@/store/auth-store";
import { E_ROLES } from "@/utils/enums";

export default function CombinedMaterialTemplate({ showBackButton = false }: { showBackButton?: boolean }) {
	const { user } = useAuthStore((state) => state);
	// Only foremen see missing-item requests, and the endpoint is foreman-only.
	const isForeman = user?.role?.name?.toLowerCase() === E_ROLES.FOREMAN.toLowerCase();

	const { data: missingItems } = useAdminMissingItemRequests(isForeman);
	const { mutate: updateNote, isPending } = useUpdateMissingItemForemanNote();
	const { openModal, closeModal, Modal } = useModal();

	const additionalRows = useMemo<MaterialRequestRow[]>(
		() => (missingItems ?? []).map(mapMissingItemToRow),
		[missingItems]
	);

	const handleMissingItemRespond = (id: string) => {
		const item = (missingItems ?? []).find((r) => r.id === id);
		if (!item) return;
		openModal({
			modalTitle: "Respond to Technician",
			subHeader: `Request #${item.requestId}`,
			showDefaultClose: true,
			modalView: (
				<ForemanNoteModal
					initialValue={item.foremanNote}
					requesterName={item.user?.name ?? undefined}
					description={item.description ?? undefined}
					isSubmitting={isPending}
					onCancel={closeModal}
					onConfirm={(note) => {
						updateNote(
							{ id: item.id, payload: { foremanNote: note } },
							{
								onSuccess: () => {
									openSuccessToast("Response sent to technician");
									closeModal();
								},
								onError: (error) => openErrorToast({ error }),
							}
						);
					}}
				/>
			),
		});
	};

	return (
		<>
			<Modal />
			<MaterialRequestsTemplate
				showBackButton={showBackButton}
				additionalRows={additionalRows}
				onMissingItemRespond={handleMissingItemRespond}
			/>
		</>
	);
}
