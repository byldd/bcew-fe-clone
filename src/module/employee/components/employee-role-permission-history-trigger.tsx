"use client";

import { History } from "lucide-react";
import { AppTooltip } from "@/components/ui/tooltip";
import { useModal } from "@/hooks/useModal";
import EmployeeRolePermissionHistoryModal from "./employee-role-permission-history-modal";
import { Button } from "@/components/ui/button";

interface EmployeeRolePermissionHistoryTriggerProps {
	userId: string;
	currentRole?: string;
}

export default function EmployeeRolePermissionHistoryTrigger({
	userId,
	currentRole,
}: EmployeeRolePermissionHistoryTriggerProps) {
	const { openModal, Modal } = useModal();

	const handleOpen = () => {
		openModal({
			modalTitle: "Roles & Permissions",
			variant: "inherit",
			modalView: <EmployeeRolePermissionHistoryModal userId={userId} currentRole={currentRole} />,
		});
	};

	return (
		<>
			<AppTooltip
				text="Roles & permissions history"
				trigger={
					<Button variant="ghost" size="icon" className="size-8" onClick={handleOpen}>
						<History className="!size-5" />
					</Button>
				}
			/>
			<Modal />
		</>
	);
}
