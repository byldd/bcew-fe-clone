"use client";

import React, { useEffect } from "react";
import { useCreateRole, useModules } from "@/module/employee/hooks/useRolesAndPermissions";
import { ACCESS_LEVEL, SKIP_HEADINGS } from "@/module/employee/enums";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { openErrorToast } from "@/components/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import {
	LOCKED_MODULES,
	MODULE_HEADING_WITH_DISPLAY_ORDER,
	MODULE_LABELS,
	ROLE_DEFAULT_TIME,
} from "@/module/employee/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InputField } from "@/components/ui/inputField";
import { MODULE } from "@/utils/enums";
import { RoleFormValues, roleSchema } from "@/module/employee/utils/role-form-schema";
import TimeInput from "@/components/ui/time-input";
import FormError from "@/components/ui/form-error";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import SpecialJobExemptToggleLabel from "./special-job-exempt copy";
import { useGetAdminPages } from "@/module/people-management/role/hooks/useRoles";
import { useGetMapZoneTabs } from "@/module/project-management/mapv2/hooks/useMapZoneTabs";
import RolePagePermissions from "@/module/people-management/role/components/role-page-permissions";
import RoleMapZoneTabPermissions from "@/module/people-management/role/components/role-map-zone-tab-permissions";
import { Form } from "@/components/ui/form";
import { isProductionEnv } from "@/utils";

interface ICreateNewRoleProps {
	onClose: () => void;
	handleSuccessfulRoleCreation: (name: string) => void;
}

export const CreateNewRoleModal = ({ onClose, handleSuccessfulRoleCreation }: ICreateNewRoleProps) => {
	const { data: modules = [] } = useModules();
	const createRole = useCreateRole();
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const { data: adminPages = [] } = useGetAdminPages();
	const { data: adminTabs = [] } = useGetMapZoneTabs();

	const form = useForm<RoleFormValues>({
		resolver: zodResolver(roleSchema),
		defaultValues: {
			roleName: "",
			dayStartTime: ROLE_DEFAULT_TIME.dayStartTime,
			dayEndTime: ROLE_DEFAULT_TIME.dayEndTime,
			canSendNotification: false,
			trackTimeByGPS: false,
			canSendTravelPayRequest: false,
			requiresScheduleValidation: true,
			isFingerprintEnabled: false,
			isSpecialCardTimeLoggingExempt: false,
		},
	});

	useEffect(() => {
		form.setValue(
			"rolePagePermissions",
			adminPages?.map((page) => {
				return {
					pageName: page.name,
					pageId: page.id,
					parentPageId: page.parentPageId,
					accessLevel: null,
				};
			})
		);
	}, [adminPages, form]);

	useEffect(() => {
		form.setValue(
			"roleMapZoneTabPermissions",
			adminTabs?.map((tab) => ({
				mapZoneTabId: tab.id,
				mapZoneTabName: tab.name,
				isVisible: false,
			}))
		);
	}, [adminTabs, form]);

	const [permissions, setPermissions] = React.useState<Record<string, ACCESS_LEVEL>>({});

	const updateAccessLevel = (moduleId: string, level: ACCESS_LEVEL) => {
		setPermissions((prev) => {
			const current = prev[moduleId];

			if (level === ACCESS_LEVEL.WRITE) {
				return {
					...prev,
					[moduleId]: current === ACCESS_LEVEL.WRITE ? ACCESS_LEVEL.READ : ACCESS_LEVEL.WRITE,
				};
			}

			if (level === ACCESS_LEVEL.READ) {
				if (current === ACCESS_LEVEL.READ || current === ACCESS_LEVEL.WRITE) {
					return { ...prev, [moduleId]: ACCESS_LEVEL.NONE };
				}
				return { ...prev, [moduleId]: ACCESS_LEVEL.READ };
			}

			return prev;
		});
	};

	useEffect(() => {
		if (modules.length > 0) {
			const initialPermissions = modules.reduce(
				(acc, modItem) => {
					acc[modItem.id] = ACCESS_LEVEL.NONE;
					return acc;
				},
				{} as Record<string, ACCESS_LEVEL>
			);
			setPermissions(initialPermissions);
		}
	}, [modules]);

	const getModuleId = (moduleName: MODULE) =>
		modules.find((modItem) => modItem.name === MODULE_LABELS[moduleName] || modItem.name === moduleName)?.id || "";

	const handleCreateRole = (values: RoleFormValues) => {
		const defaultPermissions = Object.entries(permissions).map(([moduleId, accessLevel]) => ({
			moduleId,
			accessLevel,
		}));

		const payload = {
			name: values.roleName,
			defaultPermissions,
			dayStartTime: values.dayStartTime,
			dayEndTime: values.dayEndTime,
			canSendNotification: values.canSendNotification,
			trackTimeByGPS: values.trackTimeByGPS,
			canSendTravelPayRequest: values.canSendTravelPayRequest,
			requiresScheduleValidation: values.requiresScheduleValidation,
			isSpecialCardTimeLoggingExempt: values.isSpecialCardTimeLoggingExempt,
			isFingerprintEnabled: values.isFingerprintEnabled,
			rolePagePermissions: values.rolePagePermissions,
			roleMapZoneTabPermissions: values.roleMapZoneTabPermissions,
		};

		createRole.mutate(payload, {
			onSuccess: () => {
				handleSuccessfulRoleCreation(values.roleName);
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleCreateRole)} className="space-y-5">
				{/* Role Name */}
				<div className="">
					<InputField
						label={tPmanagement.roleName}
						value={form.watch("roleName")}
						onChange={(e) => form.setValue("roleName", e.target.value)}
						placeholder={tPmanagement.enterRoleName}
					/>
					<FormError error={form?.formState?.errors?.roleName?.message} />
				</div>

				{/* Toggles */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<label className="text-sm text-brand-dark">{tPmanagement.sendNotification}</label>
						<Controller
							name="canSendNotification"
							control={form.control}
							render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
						/>
					</div>

					<div className="flex items-center justify-between">
						<label className="text-sm text-brand-dark">{tPmanagement.trackTimeByGPS}</label>
						<Controller
							name="trackTimeByGPS"
							control={form.control}
							render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
						/>
					</div>

					<div className="flex items-center justify-between">
						<label className="text-sm text-brand-dark">{tPmanagement.canSendTravelPayRequest}</label>
						<Controller
							name="canSendTravelPayRequest"
							control={form.control}
							render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
						/>
					</div>

					<div className="flex items-center justify-between">
						<label className="text-sm text-brand-dark">{tPmanagement.requiresScheduleValidation}</label>
						<Controller
							name="requiresScheduleValidation"
							control={form.control}
							render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
						/>
					</div>

					<div className="flex items-center justify-between">
						<label className="text-sm text-brand-dark">Fingerprint Permission</label>
						<Controller
							name="isFingerprintEnabled"
							control={form.control}
							render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
						/>
					</div>

					<div className="flex items-center justify-between">
						<SpecialJobExemptToggleLabel className="text-sm text-brand-dark" />
						<Controller
							name="isSpecialCardTimeLoggingExempt"
							control={form.control}
							render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
						/>
					</div>
				</div>

				{/* Working Hours */}
				<div className="space-y-3 border-t pt-4">
					<p className="text-lg font-medium text-brand-dark">{tPmanagement.roleStandardWorkingHours}</p>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<p className="mb-1 text-sm text-brand-dark60">{tPmanagement.dayStartTime}</p>
							<Controller
								control={form.control}
								name="dayStartTime"
								render={({ field }) => (
									<TimeInput date={field.value} value={field.value} onChange={field.onChange} minuteStep={15} />
								)}
							/>
							<FormError error={form?.formState?.errors?.dayStartTime?.message} />
						</div>

						<div>
							<p className="mb-1 text-sm text-brand-dark60">{tPmanagement.dayEndTime}</p>
							<Controller
								control={form.control}
								name="dayEndTime"
								render={({ field }) => (
									<TimeInput date={field.value} value={field.value} onChange={field.onChange} minuteStep={15} />
								)}
							/>
							<FormError error={form?.formState?.errors?.dayEndTime?.message} />
						</div>
					</div>
				</div>

				{/* Permissions Table */}
				<RoleMapZoneTabPermissions />

				{!isProductionEnv() ? (
					<>
						<RolePagePermissions />
					</>
				) : (
					<div className="space-y-2 border-t">
						<p className="text-sm font-semibold text-brand-dark">{tPmanagement.module}</p>
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow className="text-brand-dark50">
										<TableHead className="w-1/3">{tPmanagement.module}</TableHead>
										<TableHead className="text-center">
											<div className="flex items-center justify-center gap-1">{tPmanagement.readOnlyAccess}</div>
										</TableHead>
										<TableHead className="text-center">
											<div className="flex items-center justify-center gap-1">{tPmanagement.writeEditAccess}</div>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Object.entries(MODULE_HEADING_WITH_DISPLAY_ORDER).map(([heading, keys]) => (
										<React.Fragment key={heading}>
											{!Object.values(SKIP_HEADINGS)?.includes(heading as SKIP_HEADINGS) && (
												<TableRow>
													<TableCell colSpan={3} className="font-medium">
														{heading}
													</TableCell>
												</TableRow>
											)}

											{keys.map((modKey) => {
												const moduleId = getModuleId(modKey);
												if (!moduleId) return null;

												const access = permissions[moduleId];
												const hasRead = access === ACCESS_LEVEL.READ || access === ACCESS_LEVEL.WRITE;
												const hasWrite = access === ACCESS_LEVEL.WRITE;
												const isLocked = LOCKED_MODULES.includes(modKey);

												return (
													<TableRow key={modKey}>
														<TableCell
															className={`${
																modKey !== MODULE.DASHBOARD &&
																modKey !== MODULE.REPORTS_AND_EXPORTS &&
																modKey !== MODULE.BUILDER_COMMUNICATIONS &&
																"pl-6"
															} font-medium`}
														>
															{MODULE_LABELS[modKey] ?? modKey}
														</TableCell>
														<TableCell className="text-center">
															<Switch
																checked={hasRead}
																onCheckedChange={() => updateAccessLevel(moduleId, ACCESS_LEVEL.READ)}
																disabled={isLocked}
															/>
														</TableCell>
														<TableCell className="text-center">
															<Switch
																checked={hasWrite}
																onCheckedChange={() => updateAccessLevel(moduleId, ACCESS_LEVEL.WRITE)}
																disabled={isLocked}
															/>
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
				)}

				{/* Actions */}
				<div className="flex gap-3 border-t py-4">
					<Button disabled={createRole.isPending} onClick={onClose} variant="outline" className="w-full">
						{tCommon.cancel}
					</Button>

					<Button
						variant="filled"
						type="submit"
						loading={createRole.isPending}
						loadingText="Creating..."
						className="w-full"
					>
						{tPmanagement.createRole}
					</Button>
				</div>
			</form>
		</Form>
	);
};
