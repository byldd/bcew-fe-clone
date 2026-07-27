import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { FiEdit } from "react-icons/fi";
import RolePermissionEditModal from "@/module/employee/components/role-permission-edit-modal";
import { IRoleWithPermissions } from "../types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { IPage } from "@/module/admin/types/sideb-bar-page";
import { IMapZoneTab } from "@/module/project-management/mapv2/types/zone";

type IRolePermissionEditModalTriggerProps = {
	data: IRoleWithPermissions;
	adminAllPages: IPage[];
	adminAllTabs: IMapZoneTab[];
};

const RolePermissionEditModalTrigger = ({
	data,
	adminAllPages,
	adminAllTabs,
}: IRolePermissionEditModalTriggerProps) => {
	const { openModal, closeModal, Modal } = useModal();
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	return (
		<>
			<Button
				onClick={() =>
					openModal({
						modalTitle: tPmanagement.roleAndAccess,
						modalView: (
							<RolePermissionEditModal
								adminAllPages={adminAllPages}
								adminAllTabs={adminAllTabs}
								onClose={closeModal}
								data={data}
								showFooterActions={true}
								disabled={false}
							/>
						),
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

export default RolePermissionEditModalTrigger;
