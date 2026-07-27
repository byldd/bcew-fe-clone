import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { FiEdit } from "react-icons/fi";
import { CardTitle } from "@/components/ui/card";
import { IPermissions } from "@/module/employee/types";
import EmployeeRolePermissionEditModal from "@/module/employee/components/employee-roles-permission-edit-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface EmployeeRolePermissionEditModalTrigger {
	id: string;
	permissions: IPermissions[];
	employeeName: string;
	isPermissionEditable: boolean;
}

const EmployeeRolePermissionEditModalTrigger = ({
	id,
	permissions,
	employeeName,
	isPermissionEditable,
}: EmployeeRolePermissionEditModalTrigger) => {
	const { openModal, closeModal, Modal } = useModal();
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	return (
		<>
			<Button
				disabled={!isPermissionEditable}
				onClick={() =>
					openModal({
						modalTitle: (
							<CardTitle className="flex items-center justify-between text-xl font-semibold">
								<div>
									{tPeople.rolesAndPermission} <span className="text-brand-dark50">{`(${employeeName})`}</span>
								</div>
							</CardTitle>
						),
						modalView: <EmployeeRolePermissionEditModal onClose={closeModal} id={id} permissions={permissions} />,

						variant: "medium",
					})
				}
				variant={"ghost"}
				size={"icon"}
				className="size-8"
			>
				<FiEdit className="!size-5" />
			</Button>
			<Modal />
		</>
	);
};
export default EmployeeRolePermissionEditModalTrigger;
