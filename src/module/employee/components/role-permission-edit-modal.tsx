"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ACCESS_LEVEL, SKIP_HEADINGS } from "@/module/employee/enums";
import { IRoleWithPermissions, IPermissions } from "@/module/employee/types";
import {
	LOCKED_MODULES,
	MODULE_DISPLAY_ORDER,
	MODULE_HEADING_WITH_DISPLAY_ORDER,
	MODULE_LABELS,
} from "@/module/employee/constants";
import { useUpdateRolePermissions } from "@/module/employee/hooks/useRolesAndPermissions";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { InputField } from "@/components/ui/inputField";
import { MODULE } from "@/utils/enums";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoleFormValues, roleSchema } from "@/module/employee/utils/role-form-schema";
import TimeInput from "@/components/ui/time-input";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { getTodayDate } from "@/lib/utils/date";
import SpecialJobExemptToggleLabel from "./special-job-exempt copy";
import RolePagePermissions from "@/module/people-management/role/components/role-page-permissions";
import RoleMapZoneTabPermissions from "@/module/people-management/role/components/role-map-zone-tab-permissions";
import { Form } from "@/components/ui/form";
import { IPage } from "@/module/admin/types/sideb-bar-page";
import { IMapZoneTab } from "@/module/project-management/mapv2/types/zone";

interface RolePermissionEditModalProps {
	data: IRoleWithPermissions;
	adminAllPages: IPage[];
	adminAllTabs: IMapZoneTab[];
	onClose?: () => void;

	showFooterActions?: boolean;
	disabled?: boolean;

	formRef?: React.MutableRefObject<UseFormReturn<RoleFormValues> | null>;

	submitRef?: React.MutableRefObject<(() => void) | null>;

	onSuccess?: () => void;
}

const RolePermissionEditModal = ({
	data,
	adminAllPages,
	adminAllTabs,
	onClose,
	showFooterActions = true,
	disabled = false,
	formRef,
	submitRef,
	onSuccess,
}: RolePermissionEditModalProps) => {
	const queryClient = useQueryClient();
	const { mutate: updatePermissions, isPending: isUpdatingPermissions } = useUpdateRolePermissions(data.role.id);
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const form = useForm<RoleFormValues>({
		resolver: zodResolver(roleSchema),
		defaultValues: {
			roleName: data.role.name,
			dayStartTime: data.role.dayStartTime,
			dayEndTime: data.role.dayEndTime,
			canSendNotification: data.role.canSendNotification ?? false,
			trackTimeByGPS: data.role.trackTimeByGPS ?? false,
			canSendTravelPayRequest: data.role.canSendTravelPayRequest ?? false,
			requiresScheduleValidation: data.role.requiresScheduleValidation ?? false,
			isSpecialCardTimeLoggingExempt: data.role.isSpecialCardTimeLoggingExempt ?? false,
			isFingerprintEnabled: data.role.isFingerprintEnabled ?? false,

			rolePagePermissions: adminAllPages.map((page) => {
				const permission = data?.rolePagePermissions?.find((p) => p.pageId === page.id);
				return {
					pageId: page.id,
					pageName: page.name,
					parentPageId: page.parentPageId,
					accessLevel:
						permission?.accessLevel === ACCESS_LEVEL.READ || permission?.accessLevel === ACCESS_LEVEL.WRITE
							? permission.accessLevel
							: null,
				};
			}),

			roleMapZoneTabPermissions: adminAllTabs?.map((tab) => {
				const permission = data?.roleMapZoneTabPermissions?.find((p) => p.mapZoneTabId === tab.id);
				return {
					mapZoneTabId: tab.id,
					mapZoneTabName: tab.name,
					isVisible: permission?.isVisible ?? false,
				};
			}),
		},
	});

	const [permissions, setPermissions] = useState<IPermissions[]>(() =>
		MODULE_DISPLAY_ORDER.map((mod) => {
			const match = data.permissions.find((p) => p.module === mod);
			return {
				id: match?.id ?? "",
				moduleId: match?.moduleId ?? "",
				module: mod,
				accessLevel: match?.accessLevel ?? ACCESS_LEVEL.NONE,
			};
		})
	);

	const handleAccessChange = (module: string, level: ACCESS_LEVEL.READ | ACCESS_LEVEL.WRITE) => {
		setPermissions((prev) =>
			prev.map((permission) => {
				if (permission.module !== module) return permission;

				const current = permission.accessLevel;

				if (level === ACCESS_LEVEL.WRITE) {
					return {
						...permission,
						accessLevel: current === ACCESS_LEVEL.WRITE ? ACCESS_LEVEL.READ : ACCESS_LEVEL.WRITE,
					};
				}

				if (level === ACCESS_LEVEL.READ) {
					if (current === ACCESS_LEVEL.READ || current === ACCESS_LEVEL.WRITE) {
						return { ...permission, accessLevel: ACCESS_LEVEL.NONE };
					}
					return { ...permission, accessLevel: ACCESS_LEVEL.READ };
				}

				return permission;
			})
		);
	};

	const handleSubmit = (values: RoleFormValues) => {
		if (!data?.role?.createdBy && !data?.role?.createdByRole) {
			return openErrorToast({ message: tPmanagement.defaultSystemRolesCannotBeModified });
		}

		const payload = {
			name: values.roleName,
			dayStartTime: values.dayStartTime,
			dayEndTime: values.dayEndTime,
			canSendNotification: values.canSendNotification,
			trackTimeByGPS: values.trackTimeByGPS,
			canSendTravelPayRequest: values.canSendTravelPayRequest,
			requiresScheduleValidation: values.requiresScheduleValidation,
			isSpecialCardTimeLoggingExempt: values.isSpecialCardTimeLoggingExempt,
			isFingerprintEnabled: values.isFingerprintEnabled,
			permissions: permissions.map(({ id, accessLevel }) => ({
				permissionId: id,
				accessLevel,
			})),
			rolePagePermissions: values.rolePagePermissions,
			roleMapZoneTabPermissions: values.roleMapZoneTabPermissions,
		};

		updatePermissions(payload, {
			onSuccess: (res) => {
				openSuccessToast(res.message || tPmanagement.permissionsUpdatedSuccessfully);
				onSuccess?.();

				queryClient.invalidateQueries({ queryKey: ["admin-sidebar-pages"] });
				Promise.all([
					queryClient.refetchQueries({ queryKey: ["roleWithPermissions"] }),
					queryClient.refetchQueries({ queryKey: ["rolesWithPermissions"] }),
				]).then(() => {
					if (onClose) onClose();
				});
			},
			onError: (error) => openErrorToast({ error }),
		});
	};

	useEffect(() => {
		if (!formRef) return;

		formRef.current = form;
	}, [form, formRef]);

	useEffect(() => {
		if (!submitRef) return;

		submitRef.current = form.handleSubmit(handleSubmit);

		return () => {
			submitRef.current = null;
		};
	}, [form, permissions, submitRef]);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
				{/* Role Name */}
				<div className="px-0.5">
					<InputField
						disabled={disabled}
						label={tPmanagement.roleName}
						value={form.watch("roleName")}
						onChange={(e) => form.setValue("roleName", e.target.value)}
						placeholder={tPmanagement.enterRoleName}
					/>
					{form.formState.errors.roleName && (
						<p className="mt-1 text-sm text-red-500">{form.formState.errors.roleName.message}</p>
					)}
				</div>
				{/* Toggles */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<label className="text-sm text-brand-dark">{tPmanagement.sendNotification}</label>
						<Controller
							name="canSendNotification"
							control={form.control}
							render={({ field }) => (
								<Switch disabled={disabled} checked={field.value} onCheckedChange={field.onChange} />
							)}
						/>
					</div>

					<div className="flex items-center justify-between">
						<label className="text-sm text-brand-dark">{tPmanagement.trackTimeByGPS}</label>
						<Controller
							name="trackTimeByGPS"
							control={form.control}
							render={({ field }) => (
								<Switch disabled={disabled} checked={field.value} onCheckedChange={field.onChange} />
							)}
						/>
					</div>

					<div className="flex items-center justify-between">
						<label className="text-sm text-brand-dark">{tPmanagement.canSendTravelPayRequest}</label>
						<Controller
							name="canSendTravelPayRequest"
							control={form.control}
							render={({ field }) => (
								<Switch disabled={disabled} checked={field.value} onCheckedChange={field.onChange} />
							)}
						/>
					</div>

					<div className="flex items-center justify-between">
						<label className="text-sm text-brand-dark">{tPmanagement.requiresScheduleValidation}</label>
						<Controller
							name="requiresScheduleValidation"
							control={form.control}
							render={({ field }) => (
								<Switch disabled={disabled} checked={field.value} onCheckedChange={field.onChange} />
							)}
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

					<div className="flex items-center justify-between space-y-1">
						<SpecialJobExemptToggleLabel className="text-sm text-brand-dark" />
						<Controller
							name="isSpecialCardTimeLoggingExempt"
							control={form.control}
							render={({ field }) => (
								<Switch disabled={disabled} checked={field.value} onCheckedChange={field.onChange} />
							)}
						/>
					</div>
				</div>

				<RoleMapZoneTabPermissions disabled={disabled} />

				{/* Working Hours */}
				<div className="space-y-3 border-t pt-4">
					<p className="text-sm font-semibold text-brand-dark">{tPmanagement.roleStandardWorkingHours}</p>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<p className="mb-1 text-sm text-brand-dark60">{tPmanagement.dayStartTime}</p>
							<Controller
								control={form.control}
								name="dayStartTime"
								render={({ field }) => (
									<div>
										<TimeInput
											disabled={disabled}
											value={field.value}
											date={field.value ?? getTodayDate()}
											onChange={field.onChange}
											minuteStep={15}
										/>
										{form.formState.errors.dayStartTime && (
											<p className="mt-1 text-sm text-red-500">{form.formState.errors.dayStartTime.message}</p>
										)}
									</div>
								)}
							/>
						</div>

						<div>
							<p className="mb-1 text-sm text-brand-dark60">{tPmanagement.dayEndTime}</p>
							<Controller
								control={form.control}
								name="dayEndTime"
								render={({ field }) => (
									<div>
										<TimeInput
											disabled={disabled}
											value={field.value}
											date={field.value ?? getTodayDate()}
											onChange={field.onChange}
											minuteStep={15}
										/>
										{form.formState.errors.dayEndTime && (
											<p className="mt-1 text-sm text-red-500">{form.formState.errors.dayEndTime.message}</p>
										)}
									</div>
								)}
							/>
						</div>
					</div>
				</div>

				<RolePagePermissions disabled={disabled} />

				{/* Actions */}
				{showFooterActions && (
					<div className="flex gap-3 border-t pt-4">
						<Button disabled={isUpdatingPermissions} variant="outline" className="w-full">
							{tCommon.cancel}
						</Button>

						<Button
							variant="filled"
							type="submit"
							loading={isUpdatingPermissions}
							loadingText="Updating..."
							className="w-full"
						>
							{tCommon.update}
						</Button>
					</div>
				)}
			</form>
		</Form>
	);
};

export default RolePermissionEditModal;
