"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ACCESS_LEVEL, HAS_ACCESS, SKIP_HEADINGS } from "@/module/employee/enums";
import { EmployeeRolePermissionCardProps } from "@/module/employee/types";
import { LOCKED_MODULES, MODULE_HEADING_WITH_DISPLAY_ORDER, MODULE_LABELS } from "@/module/employee/constants";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Lock } from "lucide-react";
import { MATERIAL_ROLE, MODULE, TEAM_NAME } from "@/utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import SpecialJobExempt from "./special-job-exempt";
import { MaterialRoleLabel } from "@/utils/constants";
import { isProductionEnv } from "@/utils";
import EmployeePagePermissionEdit from "./employee-page-permission-edit";
import EmployeeRolePermissionHistoryTrigger from "./employee-role-permission-history-trigger";

export default function EmployeeRolePermissionCard({
	userWithPermissions,
	trigger,
	handlePermissionEdit,
	handleTechnicianPermission,
	isPermissionEditable,
	handleWeekendSelfScheduling,
	handleSelfScheduling,
	handleFingerprintPermission,
	handleMaterialRequestPermission,
	handleMaterialRole,
	handleQcPermission,
	handleAsanaPermission,
	handlePastDateScheduleUpdatePermission,
	handleExemptChange,
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

	const getAccessLevel = (module: string): ACCESS_LEVEL => {
		const match = permissions?.find((p) => p.module === module);
		return (match?.accessLevel as ACCESS_LEVEL) ?? ACCESS_LEVEL.NONE;
	};

	const renderBadge = (hasAccess: boolean) => (
		<span className={`${isPermissionEditable && (hasAccess ? "text-green-600" : "text-red-600")}`}>
			{hasAccess ? HAS_ACCESS.YES : HAS_ACCESS.NO}
		</span>
	);
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
						<EmployeeRolePermissionHistoryTrigger userId={userId} currentRole={user?.role} permissions={permissions} />
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
					{isProductionEnv() ? (
						<>
							<div className="font-medium text-brand-dark50">
								<p className="mb-2">{tPeople.weekendSelfScheduling}</p>
								<div className="flex items-center gap-2">
									<span className={user?.isWeekendSelfSchedulingAllowed ? "text-gray-400" : "text-black"}>
										{tPeople.off}
									</span>
									<Switch
										checked={user?.isWeekendSelfSchedulingAllowed}
										onCheckedChange={handleWeekendSelfScheduling}
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
									<Switch checked={user?.isSelfSchedulingAllowed} onCheckedChange={handleSelfScheduling} />
									<span className={user?.isWeekendSelfSchedulingAllowed ? "text-black" : "text-gray-400"}>
										{tPeople.on}
									</span>
								</div>
							</div>

							<div className="font-medium text-brand-dark50">
								<p className="mb-2">Material Request</p>
								<div className="flex items-center gap-2">
									<span className={user?.isMaterialRequestAllowed ? "text-gray-400" : "text-black"}>{tPeople.off}</span>
									<Switch checked={user?.isMaterialRequestAllowed} onCheckedChange={handleMaterialRequestPermission} />
									<span className={user?.isMaterialRequestAllowed ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
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
												disabled={!user?.isMaterialRequestAllowed}
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
										checked={currentPermission === ACCESS_LEVEL.WRITE}
										onCheckedChange={handleTechnicianPermission}
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
									<Switch checked={user?.isQcEnabled} onCheckedChange={handleQcPermission} />
									<span className={user?.isQcEnabled ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
								</div>
							</div>

							<div className="font-medium text-brand-dark50">
								<p className="mb-2">Auto-Create Bug Tickets in Asana</p>
								<div className="flex items-center gap-2">
									<span className={user?.isAsanaEnabled ? "text-gray-400" : "text-black"}>{tPeople.off}</span>
									<Switch checked={user?.isAsanaEnabled} onCheckedChange={handleAsanaPermission} />
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
										checked={user?.isPastDateScheduleUpdateAllowed}
										onCheckedChange={handlePastDateScheduleUpdatePermission}
									/>
									<span className={user?.isPastDateScheduleUpdateAllowed ? "text-black" : "text-gray-400"}>
										{tPeople.on}
									</span>
								</div>
							</div>
						</>
					) : (
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
					)}

					{/* role dependent role */}
					{isProductionEnv() ? (
						<div className="mt-4 w-full border-t pt-4">
							<div className="font-medium text-brand-dark50">
								<p className="mb-2">{tPeople.defaultPermissions}</p>
								<div className="flex items-center gap-2">
									<span className={isPermissionEditable ? "text-black" : "text-gray-400"}>{tPeople.off}</span>
									<Switch checked={!isPermissionEditable} onCheckedChange={handlePermissionEdit} />
									<span className={!isPermissionEditable ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
								</div>
							</div>

							<div className="mb-2 mt-4 flex flex-wrap items-start gap-2 text-sm sm:gap-10">
								<div className="">
									<SpecialJobExempt
										isExempt={userWithPermissions.items.user?.isSpecialCardTimeLoggingExempt}
										handleExemptChange={handleExemptChange}
										isPermissionEditable={isPermissionEditable}
									/>
								</div>

								<div className="font-medium text-brand-dark50">
									<p className="mb-2">Fingerprint Permission</p>
									<div className="flex items-center gap-2">
										<span className={user?.isFingerprintEnabled ? "text-gray-400" : "text-black"}>{tPeople.off}</span>
										<Switch
											checked={user?.isFingerprintEnabled}
											onCheckedChange={handleFingerprintPermission}
											disabled={!isPermissionEditable}
										/>
										<span className={user?.isFingerprintEnabled ? "text-black" : "text-gray-400"}>{tPeople.on}</span>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="mt-4 w-full border-t pt-4">
							{/* Default Permissions */}
							<div className="font-medium text-brand-dark50">
								<p className="mb-2">{tPeople.defaultPermissions}</p>
								<div className="flex items-center gap-2">
									<span className={isPermissionEditable ? "text-black" : "text-gray-400"}>{tPeople.off}</span>
									<Switch
										checked={!isPermissionEditable}
										disabled={!isEditing}
										onCheckedChange={handlePermissionEdit}
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
					)}
				</div>
			</CardHeader>

			{!isProductionEnv() ? (
				<EmployeePagePermissionEdit
					userPagePermission={userWithPermissions.items.userPagePermissions}
					adminAllPages={adminAllPages}
					disabled={!isEditing || !isPermissionEditable}
					pagePermissionsRef={pagePermissionsRef}
				/>
			) : (
				<CardContent className="p-0">
					<div className="space-y-4">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow className="text-brand-dark50">
										<TableHead className="w-1/3">{tPeople.module}</TableHead>
										<TableHead className="text-center">
											<div className="flex items-center justify-center gap-1">{tPeople.readOnlyAccess}</div>
										</TableHead>
										<TableHead className="text-center">
											<div className="flex items-center justify-center gap-1">{tPeople.writeEditAccess}</div>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Object.entries(MODULE_HEADING_WITH_DISPLAY_ORDER).map(([heading, modules]) => (
										<React.Fragment key={heading}>
											{/* Heading Row */}
											{!Object.values(SKIP_HEADINGS)?.includes(heading as SKIP_HEADINGS) && (
												<TableRow>
													<TableCell className="h-full w-[180px] flex-shrink-0 font-bold text-brand-dark" colSpan={3}>
														{heading}
													</TableCell>
												</TableRow>
											)}
											{/* Module Rows */}
											{modules.map((key) => {
												const level = getAccessLevel(key);
												const hasRead = level === ACCESS_LEVEL.READ || level === ACCESS_LEVEL.WRITE;
												const hasWrite = level === ACCESS_LEVEL.WRITE;
												const isLocked = LOCKED_MODULES.includes(key);

												return (
													<TableRow
														key={key}
														className={!isPermissionEditable ? "pointer-events-none cursor-not-allowed opacity-50" : ""}
													>
														<TableCell
															className={`${key !== MODULE.DASHBOARD && key !== MODULE.REPORTS_AND_EXPORTS && key !== MODULE.BUILDER_COMMUNICATIONS && "pl-6"} font-medium ${
																isLocked ? "text-gray-400" : ""
															}`}
														>
															{MODULE_LABELS[key] ?? key}
														</TableCell>
														<TableCell className="text-center">
															{isLocked ? <Lock className="mx-auto h-4 w-4 text-gray-400" /> : renderBadge(hasRead)}
														</TableCell>
														<TableCell className="text-center">
															{isLocked ? <Lock className="mx-auto h-4 w-4 text-gray-400" /> : renderBadge(hasWrite)}
														</TableCell>
													</TableRow>
												);
											})}
										</React.Fragment>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				</CardContent>
			)}
		</Card>
	);
}
