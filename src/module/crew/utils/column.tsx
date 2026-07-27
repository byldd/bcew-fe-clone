import { useModal } from "@/hooks/useModal";
import { EditCrewModal } from "@/module/crew/components/edit-crew-modal";
import { ColumnDef } from "@tanstack/react-table";
import { ICrewWithDetails } from "@/module/crew/types";
import React from "react";
import DeleteCrewModal from "@/module/crew/components/delete-crew-modal";
import SuccessModal from "@/components/success-modal";
import { useQueryClient } from "@tanstack/react-query";
import { SlTrash } from "react-icons/sl";
import { FiEdit } from "react-icons/fi";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { FaEye } from "react-icons/fa";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { openSuccessToast } from "@/components/toast";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";
import { useGetUserModuleAccess } from "@/module/profile/hooks/useProfile";
import { MODULE } from "@/utils/enums";
import { isProductionEnv } from "@/utils";

export const useCrewColumns = () => {
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const columns: ColumnDef<ICrewWithDetails>[] = [
		{
			accessorKey: "name",
			header: tPeople.memberName,
		},
		{
			accessorKey: "crewEmployees",
			header: tPeople.numberOfMembers,
			cell: ({ row }) => row.original.crewEmployees.length,
		},
		{
			accessorKey: "crewLeader.employeeName",
			header: tPeople.crewLeader,
			cell: ({ row }) => row.original?.crewLeader?.employeeName || "-",
		},
		{
			accessorKey: "department.dptnme",
			header: tPeople.department,
			cell: ({ row }) => row.original?.department?.dptnme || "-",
		},
		{
			accessorKey: "createdAt",
			header: tPeople.created,
			cell: ({ row }) => {
				const createdAt = row.original?.createdAt;
				return createdAt ? toFormattedDate(createdAt, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-";
			},
		},

		{
			id: "actions",
			header: tPeople.actions,
			cell: ({ row }) => <ActionCell crewId={row.original?.id} crew={row.original} />,
		},
	];
	return columns;
};

interface ActionCellProps {
	crewId: string;
	crew: ICrewWithDetails;
}

const ActionCell: React.FC<ActionCellProps> = ({ crew }) => {
	const { openModal, closeModal, Modal } = useModal();
	const { pageAccess } = useAdminPageAccessContext();
	const { data } = useGetUserModuleAccess(MODULE.CREW_LIST);

	const accessLevel = isProductionEnv() ? data?.data.accessLevel : pageAccess?.accessLevel;

	const queryClient = useQueryClient();
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const handleSuccessfulCrewDelete = () => {
		// 	openModal({
		// 		modalTitle: tPeople.crewDeletedSuccessfully,
		// 		modalView: (
		// 			<SuccessModal
		// 				closeModal={() => {
		// 					closeModal();
		// 					queryClient.invalidateQueries({ queryKey: ["crews"] });
		// 				}}
		// 				buttonText={tPeople.okay}
		// 			/>
		// 		),
		// 	});
		// };
		openSuccessToast(tPeople.crewDeletedSuccessfully);
		queryClient.invalidateQueries({ queryKey: ["crews"] });
		closeModal();
	};

	const handleSuccessfulCrewUpdate = () => {
		openModal({
			modalTitle: tPeople.changesSaved,
			modalView: (
				<SuccessModal
					closeModal={() => {
						closeModal();
						queryClient.invalidateQueries({ queryKey: ["crews"] });
					}}
					description={tPeople.changesSavedFor}
					subDescription={crew.name}
					buttonText={tPeople.okay}
				/>
			),
		});
	};

	const handleEditClick = () => {
		openModal({
			modalTitle: (
				<span>
					{accessLevel === ACCESS_LEVEL.WRITE && tPeople.editCrew}
					<span className="text-brand-dark50">({crew.name})</span>
				</span>
			),
			modalView: (
				<EditCrewModal
					onClose={closeModal}
					crew={crew}
					handleSuccessfulCrewUpdate={handleSuccessfulCrewUpdate}
					accessLevel={accessLevel}
				/>
			),
			variant: "medium",
		});
	};

	const handleDeleteClick = () => {
		openModal({
			modalTitle: (
				<span>
					{tschedule.deleteCrew}
					<span className="text-brand-dark50">({crew.name})</span>
				</span>
			),
			modalView: (
				<DeleteCrewModal onClose={closeModal} crew={crew} handleSuccessfulCrewDelete={handleSuccessfulCrewDelete} />
			),
		});
	};

	return (
		<>
			<Modal />
			<div className="flex w-full items-center justify-center gap-2 px-4" onClick={(e) => e.stopPropagation()}>
				{accessLevel === ACCESS_LEVEL.WRITE ? (
					<FiEdit size={25} className="cursor-pointer p-1" onClick={handleEditClick} />
				) : (
					<FaEye className="h-5 w-5 cursor-pointer" onClick={handleEditClick} />
				)}
				{accessLevel === ACCESS_LEVEL.WRITE && (
					<SlTrash size={25} className="cursor-pointer p-1 text-brand-red" onClick={handleDeleteClick} />
				)}
			</div>
		</>
	);
};
