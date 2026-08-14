"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FaRegEdit } from "react-icons/fa";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";
import { useModal } from "@/hooks/useModal";
import { IAdminCrateActivityItem } from "../types";
import { CRATE_STATUS_BADGE_STYLE, CRATE_STATUS_LABEL } from "./constants";
import { CratePhotosPreview } from "../components/crate-photos-preview";
import { CrateActivityDetailsModal } from "../components/crate-activity-details-modal";

const StatusBadge = ({ status }: { status: CRATE_SCAN_ACTION }) => (
	<span
		className={`min-w-[90px] rounded-[6px] px-2 py-1.5 text-center text-xs font-medium ${CRATE_STATUS_BADGE_STYLE[status]}`}
	>
		{CRATE_STATUS_LABEL[status]}
	</span>
);

const SealTagCell = ({ item }: { item: IAdminCrateActivityItem }) => {
	if (item.sealStatus === false) {
		return (
			<div className="flex flex-col items-center">
				<span className="text-sm font-medium text-brand-dark">No</span>
				<span className="text-xs text-red-500">Error Detected</span>
			</div>
		);
	}

	return <span className="text-sm font-medium text-brand-dark">Yes</span>;
};

const ActionCell = ({ item, canEdit }: { item: IAdminCrateActivityItem; canEdit: boolean }) => {
	const { openModal, closeModal, Modal } = useModal();

	if (!canEdit) {
		return <span className="text-brand-dark50">--</span>;
	}

	return (
		<div className="flex items-center justify-center">
			<FaRegEdit
				size={16}
				className="cursor-pointer text-brand-dark"
				onClick={() =>
					openModal({
						modalTitle: `Crate #${item.scanned_crate}`,
						variant: "medium",
						modalView: <CrateActivityDetailsModal item={item} onClose={closeModal} />,
					})
				}
			/>
			<Modal />
		</div>
	);
};

// A crate can have multiple audit rows (one per receive/return). The edit icon should only
// show for a RECEIVE row when no RETURN row exists yet for that same jobnum+tasknum+crate -
// matching on scanned_crate alone would wrongly hide/show the icon across different jobs.
const hasReturnedEntry = (items: IAdminCrateActivityItem[], item: IAdminCrateActivityItem): boolean =>
	items.some(
		(other) =>
			other.jobnum === item.jobnum &&
			other.tasknum === item.tasknum &&
			other.scanned_crate === item.scanned_crate &&
			other.scan_action === CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN
	);

export const useAdminCrateActivityColumns = (items: IAdminCrateActivityItem[]) => {
	const columns: ColumnDef<IAdminCrateActivityItem>[] = [
		{
			id: "jobName",
			header: "Job Name",
			cell: ({ row }) => <span className="text-sm font-medium text-brand-dark">{row.original.jobName ?? "--"}</span>,
		},
		{
			id: "phase",
			header: "Phase",
			cell: ({ row }) => <span className="text-sm font-medium text-brand-dark">{row.original.phase ?? "--"}</span>,
		},
		{
			id: "crateNumber",
			header: "Crate#",
			accessorKey: "scanned_crate",
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => <StatusBadge status={row.original.scan_action as CRATE_SCAN_ACTION} />,
		},
		{
			id: "technician",
			header: "Technician",
			cell: ({ row }) => row.original.user.name,
		},
		{
			id: "sealTagIntact",
			header: "Seal Tag Intact",
			cell: ({ row }) => <SealTagCell item={row.original} />,
		},
		{
			id: "imagesAndNotes",
			header: "Images & Note",
			cell: ({ row }) => <CratePhotosPreview photos={row.original.photos} note={row.original.note} />,
		},
		{
			id: "returned",
			header: "Returned",
			cell: ({ row }) => {
				const item = row.original;
				const isReturn = item.scan_action === CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN;
				return isReturn ? toFormattedDate(item.scanned_date, DATE_FORMAT.DATE_AND_TIME) : "--";
			},
		},
		{
			id: "action",
			header: "Action",
			cell: ({ row }) => {
				const item = row.original;
				const canEdit =
					item.scan_action === CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RECEIVE && !hasReturnedEntry(items, item);

				return <ActionCell item={item} canEdit={canEdit} />;
			},
		},
	];

	return columns;
};
