"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useModal } from "@/hooks/useModal";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useAdminMissingItemRequests, useUpdateMissingItemForemanNote } from "../hooks/useAdminMissingItemRequests";
import ForemanNoteModal from "./foreman-note-modal";
import type { AdminMissingItemRequest } from "../utils/types";
import { getAdminMissingItemRequestsColumns } from "../utils/admin-missing-item-requests-columns";
import SectionHeader from "@/components/shared/section-header";
import BackButton from "@/components/common/back-button";

export default function MissingItemRequestsAdminTemplate({
	showBackButton = false,
	hideHeader = false,
}: {
	showBackButton?: boolean;
	hideHeader?: boolean;
}) {
	const { data, isLoading } = useAdminMissingItemRequests(true);
	const { mutate: updateNote, isPending } = useUpdateMissingItemForemanNote();
	const { openModal, closeModal, Modal } = useModal();

	const handleRespond = (row: AdminMissingItemRequest) => {
		openModal({
			modalTitle: "Respond to Technician",
			subHeader: `Request #${row.requestId}`,
			showDefaultClose: true,
			modalView: (
				<ForemanNoteModal
					initialValue={row.foremanNote}
					requesterName={row.user?.name ?? undefined}
					description={row.description ?? undefined}
					isSubmitting={isPending}
					onCancel={closeModal}
					onConfirm={(note) => {
						updateNote(
							{ id: row.id, payload: { foremanNote: note } },
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

	const columns = useMemo(() => getAdminMissingItemRequestsColumns({ onRespond: handleRespond }), [isPending]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="w-full space-y-8 bg-white px-2 py-4">
			<Modal />
			{!hideHeader && (
				<div className="flex items-center gap-2">
					{showBackButton && <BackButton />}
					<SectionHeader title="Unknown Items" />
				</div>
			)}
			<DataTable
				useSectionHeader={false}
				columns={columns}
				data={data ?? []}
				isLoading={isLoading}
				showGridLines
				stickyHeaderMode
				mobileCompact
			/>
		</div>
	);
}
