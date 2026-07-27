"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HISTORY_TAB } from "@/module/employee/enums";
import { IPermissions } from "@/module/employee/types";
import RoleChangeHistoryList from "./role-change-history-list";
import PermissionChangeHistoryList from "./permission-change-history-list";
import CurrentPermissionTable from "./current-permission-table";

interface EmployeeRolePermissionHistoryModalProps {
	userId: string;
	currentRole?: string;
	permissions?: IPermissions[];
}

const TAB_TRIGGER_CLASS =
	"inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark";

export default function EmployeeRolePermissionHistoryModal({
	userId,
	currentRole,
	permissions,
}: EmployeeRolePermissionHistoryModalProps) {
	const [activeTab, setActiveTab] = useState<HISTORY_TAB>(HISTORY_TAB.ROLE_CHANGE);

	return (
		<div className="w-[420px] max-w-full border-t bg-white pt-3">
			<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as HISTORY_TAB)}>
				<TabsList className="my-2 inline-flex h-9 w-full items-center justify-start gap-2 rounded-md bg-transparent text-muted-foreground">
					<TabsTrigger className={TAB_TRIGGER_CLASS} value={HISTORY_TAB.ROLE_CHANGE}>
						Role Change History
					</TabsTrigger>
					<TabsTrigger className={TAB_TRIGGER_CLASS} value={HISTORY_TAB.PERMISSION_CHANGE}>
						Permission Change History
					</TabsTrigger>
				</TabsList>

				<TabsContent value={HISTORY_TAB.ROLE_CHANGE}>
					<RoleChangeHistoryList userId={userId} currentRole={currentRole} />
				</TabsContent>

				<TabsContent value={HISTORY_TAB.PERMISSION_CHANGE}>
					<CurrentPermissionTable permissions={permissions} />
					<PermissionChangeHistoryList userId={userId} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
