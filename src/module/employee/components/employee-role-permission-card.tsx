"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import { ACCESS_LEVEL } from "@/module/employee/enums";
import { EmployeeRolePermissionCardProps } from "@/module/employee/types";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { MATERIAL_ROLE, TEAM_NAME } from "@/utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import SpecialJobExempt from "./special-job-exempt";
import { MaterialRoleLabel } from "@/utils/constants";
import EmployeePagePermissionEdit from "./employee-page-permission-edit";
import EmployeeRolePermissionHistoryTrigger from "./employee-role-permission-history-trigger";

export default function EmployeeRolePermissionCard({
	userWithPermissions,
	trigger,

	isPermissionEditable,
	setIsPermissionEditable,

	handleMaterialRole,

	currentPermission,
	teamName,
	userRole,
	adminAllPages,
	id: userId,
	isEditing,
	pagePermissionsRef,
	stagingConfiguration,
	setStagingConfiguration,
}: EmployeeRolePermissionCardProps) {
	const { user, permissions } = userWithPermissions?.items;

	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	const TEAM_MATERIAL_ROLES: Partial<Record<string, MATERIAL_ROLE[]>> = {
		[TEAM_NAME.WAREHOUSE]: [MATERIAL_ROLE.WAREHOUSE_MANAGER, MATERIAL_ROLE.PROCUREMENT_SPECIALIST],
		[TEAM_NAME.OFFICE]: [MATERIAL_ROLE.OFFICE_MANAGER],
	};
	const visibleMaterialRoles: MATERIAL_ROLE[] = teamName ? (TEAM_MATERIAL_ROLES[teamName] ?? []) : [];

	const rolePagePermissions = isPermissionEditable
		? userWithPermissions.items.userPagePermissions
		: userRole?.rolePagePermissions;

	return (
		<Card className="rounded-3xl border border-brand-dark10 bg-white !p-7">
			<CardHeader className="mb-4 p-0">
				<CardTitle className="mb-4 flex items-center justify-between text-xl font-semibold">
					{tPeople.rolesAndPermission}
					<span className="flex items-center gap-2">
						<EmployeeRolePermissionHistoryTrigger userId={userId} currentRole={user?.role} />
						{trigger}
					</span>
				</CardTitle>

				<div className="flex flex-wrap items-start gap-2 text-sm sm:gap-10">
					{/* Role Assigned */}
					<div className="font-medium text-brand-dark50">
						<p className="mb-2">{tPeople.roleAssigned}</p>
						<p className="font-semibold text-brand-dark">{user?.role}</p>
					</div>

					{/* Empployee level toogle */}

					<>
						<div className="font-medium text-brand-dark50">
							<p className="mb-2">{tPeople.weekendSelfScheduling}</p>
							<div className="flex items-center gap-2">
								<span className={user?.isWeekendSelfSchedulingAllowed ? "text-gray-400" : "text-black"}>
									{tPeople.off}
								</span>
								<Switch
									disabled={!isEditing}
									checked={stagingConfiguration?.isWeekendSelfSchedulingAllowed}
									onCheckedChange={(value) => {
										setStagingConfiguration((prev) => ({
											...prev,
											isWeekendSelfSchedulingAllowed: value,
										}));
									}}
								/>
								<span className={user?.isWeekendSelfSchedulingAllowed ? "text-black" : "text-gray-400"}>
									{tPeople.on}
								</span>
							</div>
						</div>

						<div className="font-medium text-brand-dark50">
							<p className="mb-2">Weekday Self-Scheduling</p>
							<div className="flex items-center gap-2">
								<span className={user?.isSelfSchedulingAllowed ? "text-gray-400" : "text-black"}>{tPeople.off}</span>
								<Switch
									disabled={!isEditing}
									checked={stagingConfiguration?.isSelfSchedulingAllowed}
									onCheckedChange={(value) => {
										setStagingConfiguration((prev) => ({
											...prev,
											isSelfSchedulingAllowed: value,
										}));
									}}
								/>
								<span className={user?.isWeekendSelfSchedulingAllowed ? "text-black" : "text-gray-400"}>
									{tPeople.on}
								</span>
							</div>
						</div>

						<div className="font-medium text-brand-dark50">
							<p className="mb-2">Material Request</p>
							<div className="flex items-center gap-2">
								<span className={user?.isMaterialRequestAllowed ? "text-gray-400" : "text-black"}>{tPeople.off}</span>
								<Switch
									disabled={!isEditing}
									checked={stagingConfiguration?.isMaterialRequestAllowed}
									onCheckedChange={(value) => {
										setStagingConfiguration((prev) => ({
											...prev,
											isMaterialRequestAllowed: value,
										}));
									}}
								/>
								<span className={user?.isMaterialRequestAllowed ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
							</div>
						</div>

						<div className="font-medium text-brand-dark50">
							<p className="mb-2">Crate Handler</p>
							<div className="flex items-center gap-2">
								<span className={user?.isCrateHandlerAllowed ? "text-gray-400" : "text-black"}>{tPeople.off}</span>
								<Switch
									disabled={!isEditing}
									checked={stagingConfiguration?.isCrateHandlerAllowed}
									onCheckedChange={(value) => {
										setStagingConfiguration((prev) => ({
											...prev,
											isCrateHandlerAllowed: value,
										}));
									}}
								/>
								<span className={user?.isCrateHandlerAllowed ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
							</div>
						</div>

						{visibleMaterialRoles.map((role) => {
							const isActive = user?.materialRole === role;
							return (
								<div key={role} className="font-medium text-brand-dark50">
									<p className="mb-2">{MaterialRoleLabel[role]}</p>
									<div className="flex items-center gap-2">
										<span className={isActive ? "text-gray-400" : "text-black"}>{tPeople.off}</span>
										<Switch
											checked={isActive}
											disabled={!isEditing && !user?.isMaterialRequestAllowed}
											onCheckedChange={(checked) => handleMaterialRole(checked ? role : null)}
										/>
										<span className={isActive ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
									</div>
								</div>
							);
						})}

						<div className="font-medium text-brand-dark50">
							<p className="mb-2">Modify Technician Notes</p>

							<div className="flex items-center gap-2">
								<span className={currentPermission === ACCESS_LEVEL.READ ? "text-black" : "text-gray-400"}>
									{tPeople.off}
								</span>
								<Switch
									disabled={!isEditing}
									checked={stagingConfiguration?.releaseNotePermission === ACCESS_LEVEL.WRITE}
									onCheckedChange={(value) => {
										setStagingConfiguration((prev) => ({
											...prev,
											releaseNotePermission: value ? ACCESS_LEVEL.WRITE : ACCESS_LEVEL.READ,
										}));
									}}
								/>
								<span className={currentPermission === ACCESS_LEVEL.WRITE ? "text-black" : "text-gray-400"}>
									{tPeople.on}
								</span>
							</div>
						</div>

						<div className="font-medium text-brand-dark50">
							<p className="mb-2">QC Enabled</p>
							<div className="flex items-center gap-2">
								<span className={user?.isQcEnabled ? "text-gray-400" : "text-black"}>{tPeople.off}</span>
								<Switch
									disabled={!isEditing}
									checked={stagingConfiguration?.isQcEnabled}
									onCheckedChange={(value) => {
										setStagingConfiguration((prev) => ({
											...prev,
											isQcEnabled: value,
										}));
									}}
								/>
								<span className={user?.isQcEnabled ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
							</div>
						</div>

						<div className="font-medium text-brand-dark50">
							<p className="mb-2">Auto-Create Bug Tickets in Asana</p>
							<div className="flex items-center gap-2">
								<span className={user?.isAsanaEnabled ? "text-gray-400" : "text-black"}>{tPeople.off}</span>
								<Switch
									disabled={!isEditing}
									checked={stagingConfiguration?.isAsanaEnabled}
									onCheckedChange={(value) => {
										setStagingConfiguration((prev) => ({
											...prev,
											isAsanaEnabled: value,
										}));
									}}
								/>
								<span className={user?.isAsanaEnabled ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
							</div>
						</div>

						<div className="font-medium text-brand-dark50">
							<p className="mb-2">Allow Past Date Schedule Update</p>
							<div className="flex items-center gap-2">
								<span className={user?.isPastDateScheduleUpdateAllowed ? "text-gray-400" : "text-black"}>
									{tPeople.off}
								</span>
								<Switch
									disabled={!isEditing}
									checked={stagingConfiguration?.isPastDateScheduleUpdateAllowed}
									onCheckedChange={(value) => {
										setStagingConfiguration((prev) => ({
											...prev,
											isPastDateScheduleUpdateAllowed: value,
										}));
									}}
								/>
								<span className={user?.isPastDateScheduleUpdateAllowed ? "text-black" : "text-gray-400"}>
									{tPeople.on}
								</span>
							</div>
						</div>
					</>

					{/* role dependent role */}

					<div className="mt-4 w-full border-t pt-4">
						{/* Default Permissions */}
						<div className="font-medium text-brand-dark50">
							<p className="mb-2">{tPeople.defaultPermissions}</p>
							<div className="flex items-center gap-2">
								<span className={isPermissionEditable ? "text-black" : "text-gray-400"}>{tPeople.off}</span>
								<Switch
									checked={!isPermissionEditable}
									disabled={!isEditing}
									onCheckedChange={(checked) => setIsPermissionEditable(!checked)}
								/>
								<span className={!isPermissionEditable ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
							</div>
						</div>

						<div className="mb-2 mt-4 flex flex-wrap items-start gap-2 text-sm sm:gap-10">
							<div className="">
								<SpecialJobExempt
									isExempt={stagingConfiguration.isSpecialCardTimeLoggingExempt}
									isPermissionEditable={isEditing && isPermissionEditable ? true : false}
									handleExemptChange={(value) => {
										setStagingConfiguration((prev) => ({
											...prev,
											isSpecialCardTimeLoggingExempt: value,
										}));
									}}
								/>
							</div>

							<div className="font-medium text-brand-dark50">
								<p className="">Fingerprint Permission</p>
								<div className="flex items-center gap-2">
									<span className={user?.isFingerprintEnabled ? "text-gray-400" : "text-black"}>{tPeople.off}</span>
									<Switch
										checked={stagingConfiguration?.isFingerprintEnabled}
										onCheckedChange={(value) => {
											setStagingConfiguration((prev) => ({
												...prev,
												isFingerprintEnabled: value,
											}));
										}}
										disabled={isEditing && isPermissionEditable ? false : true}
									/>
									<span className={user?.isFingerprintEnabled ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</CardHeader>

			<EmployeePagePermissionEdit
				userPagePermission={rolePagePermissions}
				adminAllPages={adminAllPages}
				disabled={!isEditing || !isPermissionEditable}
				pagePermissionsRef={pagePermissionsRef}
			/>
		</Card>
	);
}
