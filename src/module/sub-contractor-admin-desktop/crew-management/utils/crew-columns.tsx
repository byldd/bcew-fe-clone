import { useModal } from "@/hooks/useModal";
import { toFormattedDate } from "@/lib/utils/date";
import { ISubContractorCrew } from "@/module/admin-sub-contractor/types";
import { ColumnDef } from "@tanstack/react-table";
import { FiEdit } from "react-icons/fi";
import { SlTrash } from "react-icons/sl";
import { DeleteSubContractorCrew } from "../../../sub-contractor/components/delete-crew";
import UpdateSubContractorCrewDesktopForm from "../components/update-sub-contractor-crew-desktop-form";
import { useQueryClient } from "@tanstack/react-query";
import SuccessModal from "@/components/success-modal";

import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";

export const AllCrewColumns = () => {
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);
	const Columns: ColumnDef<ISubContractorCrew>[] = [
		{
			accessorKey: "name",
			header: tSub.crewName,
			cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
		},
		{
			accessorKey: "crewLeaderName",
			header: tSub.crewLeader,
		},
		{
			accessorKey: "phoneNumber",
			header: tSub.phoneNumber,
		},
		{
			accessorKey: "email",
			header: tSub.emailId,
			size: 150,
			cell: ({ row }) => (
				<a
					href={`mailto:${row.original.email}`}
					className="block max-w-[140px] truncate text-blue-600 hover:underline"
					title={row.original.email}
				>
					{row.original.email}
				</a>
			),
		},
		{
			accessorKey: "createdAt",
			header: tSub.creationDate,
			cell: ({ row }) => (row?.original?.createdAt ? toFormattedDate(row?.original?.createdAt) : "-"),
		},
		{
			accessorKey: "access",
			header: tSub.access,
			cell: ({ row }) => (row?.original?.isAccessPaused ? "Paused" : "Active"),
		},
		{
			id: "actions",
			header: tSub.actions,
			cell: ({ row }) => <ActionCell crewId={row.original?.id} crew={row.original} />,
		},
	];
	return Columns;
};

interface ActionCellProps {
	crewId: string;
	crew: ISubContractorCrew;
}

const ActionCell: React.FC<ActionCellProps> = ({ crew }) => {
	const { openModal, closeModal, Modal } = useModal();
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	const queryClient = useQueryClient();

	const handleSuccessfulCrewUpdate = () => {
		openModal({
			modalTitle: tSub.changesSaved,
			modalView: (
				<SuccessModal
					closeModal={() => {
						closeModal();
						queryClient.invalidateQueries({ queryKey: ["subContractorCrews"] });
					}}
					description={tSub.changesSavedDescription}
					subDescription={crew?.name}
					buttonText={tSub.okay}
				/>
			),
		});
	};

	const handleEditClick = () => {
		openModal({
			modalTitle: tSub.updateCrew,
			modalView: (
				<UpdateSubContractorCrewDesktopForm
					onClose={closeModal}
					crew={crew}
					handleSuccessfulCrewUpdate={handleSuccessfulCrewUpdate}
				/>
			),
			variant: "medium",
		});
	};

	const handleDeleteClick = () => {
		openModal({
			modalTitle: `Delete Crew '${crew?.name}'`,
			modalView: <DeleteSubContractorCrew onClose={closeModal} crewId={crew?.id} crewName={crew?.name} />,
		});
	};

	return (
		<>
			<Modal />
			{!crew?.deletedAt && (
				<div className="flex w-full items-center justify-center gap-2 px-4" onClick={(e) => e.stopPropagation()}>
					<FiEdit size={25} className="cursor-pointer p-1" onClick={handleEditClick} />

					<SlTrash size={25} className="cursor-pointer p-1 text-brand-red" onClick={handleDeleteClick} />
				</div>
			)}
		</>
	);
};
