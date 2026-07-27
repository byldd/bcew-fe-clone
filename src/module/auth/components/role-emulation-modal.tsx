"use client";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/selectField";
import { useMemo, useState } from "react";
import { useAuthAPI } from "../hooks/useAuth";

interface Props {
	currentRole?: {
		id: string;
		name: string;
	};

	onContinue: () => void;

	onSelectRole: (roleId: string) => void;

	onSelectUser: (userId: string) => void;
}

export default function RoleEmulationModal({ currentRole, onContinue, onSelectRole, onSelectUser }: Props) {
	const { useRolesList, useImpersonationUsers } = useAuthAPI();

	const [selectedRoleId, setSelectedRoleId] = useState("");
	const [selectedUserId, setSelectedUserId] = useState("");

	const { data: roles, isPending: isRolesLoading } = useRolesList();

	const { data: users, isPending: isUsersLoading } = useImpersonationUsers();

	const handleRoleChange = (roleId: string) => {
		setSelectedRoleId(roleId);

		if (roleId) {
			setSelectedUserId("");
		}
	};

	const handleUserChange = (userId: string) => {
		setSelectedUserId(userId);

		if (userId) {
			setSelectedRoleId("");
		}
	};

	const filteredRoles = useMemo(() => {
		if (!roles) return [];

		return roles.filter((role) => role.id !== currentRole?.id);
	}, [roles, currentRole]);

	if (isRolesLoading || isUsersLoading) {
		return <div className="py-6 text-center text-sm text-brand-grey">Loading...</div>;
	}

	return (
		<div className="space-y-4">
			<p className="text-xs text-brand-grey">
				Select either a role or a user to emulate. You can temporarily view and use the application with the selected
				role or user. A yellow banner will remind you that emulation is active.
			</p>

			<div className="flex h-10 items-center justify-between rounded-[8px] border-none bg-brand-bgLightgrey p-2">
				<p className="text-sm text-brand-grey">Your actual role</p>

				<p className="text-sm font-medium text-brand-dark">{currentRole?.name ?? "-"}</p>
			</div>

			<SelectField
				label="Select Role to Emulate"
				placeholder="Choose role"
				options={filteredRoles.map((role) => ({
					label: role.name,
					value: role.id,
				}))}
				value={selectedRoleId}
				onValueChange={handleRoleChange}
				disabled={!!selectedUserId}
			/>

			<SelectField
				label="Select User to Emulate"
				placeholder="Choose user"
				options={
					users?.map((user) => ({
						label: `${user.name} (${user.role?.name ?? "-"})`,
						value: user.id,
					})) ?? []
				}
				value={selectedUserId}
				onValueChange={handleUserChange}
				disabled={!!selectedRoleId}
			/>

			<div className="flex gap-2">
				<Button variant="outline" className="w-full" onClick={onContinue}>
					Cancel
				</Button>

				<Button
					variant="filled"
					className="w-full"
					disabled={!selectedRoleId && !selectedUserId}
					onClick={() => {
						if (selectedRoleId) {
							onSelectRole(selectedRoleId);
							return;
						}

						onSelectUser(selectedUserId);
					}}
				>
					Apply View
				</Button>
			</div>
		</div>
	);
}
