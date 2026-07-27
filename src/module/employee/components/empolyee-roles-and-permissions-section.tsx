import { useEffect, useRef, useState } from "react";
import {
	useAssignUserNewRole,
	useEmployeePermissions,
	useEmployeeUpdatePermissions,
	useUpdateFingerprintPermission,
	useUpdateMaterialRequestPermission,
	useUpdateMaterialRole,
	useUpdateAsanaPermission,
	useUpdatePastDateScheduleUpdatePermission,
	useUpdateQcPermission,
	useUpdateSelfScheduling,
	useUpdateTechnicianPermission,
	useUpdateWeekendSelfScheduling,
	useUpdateUserPagesPermissions,
	useUpdateSpecialJobExempt,
} from "@/module/employee/hooks/useEmployee";
import EmployeeRolePermissionCard from "./employee-role-permission-card";
import EmployeeRolePermissionEditModalTrigger from "@/module/employee/components/employee-role-permission-edit-modal-trigger";
import { IEmployeeDetailsResponse, IUserPagesPermissionPayload, StagingConfiguration } from "@/module/employee/types";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useRoleWithPermissions } from "../hooks/useRolesAndPermissions";
import { useGetAdminPages } from "@/module/people-management/role/hooks/useRoles";
import { isProductionEnv } from "@/utils";
import EditPermissions from "./edit-permissions";
import { ACCESS_LEVEL } from "../enums";

interface EmployeeRolePermissionSectionProps {
	userId: string;
	employee: IEmployeeDetailsResponse;
}

export const EmployeeRolePermissionSection = ({ userId, employee }: EmployeeRolePermissionSectionProps) => {
	const { data: userWithPermissions, isPending, isError } = useEmployeePermissions(userId);
	const queryClient = useQueryClient();
	const updateRole = useAssignUserNewRole(employee.employee?.userId);
	const updateTechnicianPermission = useUpdateTechnicianPermission();
	const { mutate: updateWeekendScheduling } = useUpdateWeekendSelfScheduling();
	const { mutate: updateSelfScheduling } = useUpdateSelfScheduling();
	const { mutate: updateFingerprint } = useUpdateFingerprintPermission();
	const { mutate: updateMaterialRequestPermission } = useUpdateMaterialRequestPermission();
	const { mutate: updateMaterialRole } = useUpdateMaterialRole();
	const updateEmployeePermissionsMutation = useEmployeeUpdatePermissions(userId);
	const { mutate: updateUserPagesPermissions, isPending: isSaving } = useUpdateUserPagesPermissions();
	const currentPermission = employee?.employee?.user?.employeeReleaseNotePermission;
	const [isPermissionEditable, setIsPermissionEditable] = useState<boolean>(true);
	const { data: roleData } = useRoleWithPermissions(employee.employee.user.roleId);
	const { data: adminPages } = useGetAdminPages();
	const { mutate: updateQcPermission } = useUpdateQcPermission();
	const { mutate: updateAsanaPermission } = useUpdateAsanaPermission();
	const { mutate: updatePastDateScheduleUpdatePermission } = useUpdatePastDateScheduleUpdatePermission();
	const { mutate: updateSpecialJobExempt } = useUpdateSpecialJobExempt();

	const [isEditing, setIsEditing] = useState(false);

	const [stagingConfiguration, setStagingConfiguration] = useState<StagingConfiguration>({
		isWeekendSelfSchedulingAllowed: false,
		isSelfSchedulingAllowed: false,
		isMaterialRequestAllowed: false,
		releaseNotePermission: ACCESS_LEVEL.READ,
		isQcEnabled: false,
		isAsanaEnabled: false,
		isFingerprintEnabled: false,
		isSpecialCardTimeLoggingExempt: false,
		isPastDateScheduleUpdateAllowed: false,
	});

	const [initialConfiguration, setInitialConfiguration] = useState<StagingConfiguration>(stagingConfiguration);

	const pagePermissionsRef = useRef<IUserPagesPermissionPayload["userPagePermissions"]>([]);

	useEffect(() => {
		const overrideFromDb = userWithPermissions?.items?.user?.isPermissionOverridden ?? false;
		setIsPermissionEditable(overrideFromDb);
	}, [userWithPermissions?.items?.user?.isPermissionOverridden]);

	useEffect(() => {
		if (!userWithPermissions) return;

		const configuration: StagingConfiguration = {
			isWeekendSelfSchedulingAllowed: userWithPermissions.items.user.isWeekendSelfSchedulingAllowed,

			isSelfSchedulingAllowed: userWithPermissions.items.user.isSelfSchedulingAllowed,

			isMaterialRequestAllowed: userWithPermissions.items.user.isMaterialRequestAllowed,

			releaseNotePermission: currentPermission as ACCESS_LEVEL,

			isQcEnabled: userWithPermissions.items.user.isQcEnabled,

			isAsanaEnabled: userWithPermissions.items.user.isAsanaEnabled,

			isFingerprintEnabled: userWithPermissions.items.user.isFingerprintEnabled,

			isSpecialCardTimeLoggingExempt: userWithPermissions?.items?.user?.isSpecialCardTimeLoggingExempt,

			isPastDateScheduleUpdateAllowed: userWithPermissions.items.user.isPastDateScheduleUpdateAllowed,
		};

		setStagingConfiguration(configuration);
		setInitialConfiguration(configuration);
	}, [userWithPermissions, currentPermission]);

	const handlePermissionEditToggle = () => {
		const goingToEditManually = !isPermissionEditable;

		if (goingToEditManually) {
			setIsPermissionEditable(true);
			updateEmployeePermissionsMutation.mutate([], {
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["employeePermissions"] });
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			});
		} else {
			updateRole.mutate(employee?.employee?.user?.roleId, {
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["employeePermissions"] });
					openSuccessToast("Role permissions restored.");
					setIsPermissionEditable(false);
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			});
		}
	};

	const handleTechnicianPermission = () => {
		if (!employee?.employee?.user?.id) return;

		updateTechnicianPermission.mutate(employee.employee.user.id, {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["employee"],
				});

				openSuccessToast("Technician permission updated successfully.");
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	const handleWeekendSelfScheduling = (value: boolean) => {
		const message = `Weekend self-scheduling ${value ? "enabled" : "disabled"} successfully`;

		updateWeekendScheduling(
			{
				isAllowed: value,
				userId,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["employeePermissions", userId],
					});
					openSuccessToast(message);
				},
				onError: () => {
					openErrorToast({ message: "Failed to update weekend self-scheduling." });
				},
			}
		);
	};

	const handleSelfScheduling = (value: boolean) => {
		const message = `Self-scheduling ${value ? "enabled" : "disabled"} successfully`;

		updateSelfScheduling(
			{
				isAllowed: value,
				userId,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["employeePermissions", userId],
					});
					openSuccessToast(message);
				},
				onError: () => {
					openErrorToast({ message: "Failed to update weekend self-scheduling." });
				},
			}
		);
	};

	const handleFingerprintPermission = (value: boolean) => {
		const message = `Fingerprint permission ${value ? "enabled" : "disabled"} successfully`;

		updateFingerprint(
			{
				isEnabled: value,
				userId,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["employeePermissions", userId],
					});
					openSuccessToast(message);
				},
				onError: () => {
					openErrorToast({ message: "Failed to update fingerprint permission." });
				},
			}
		);
	};

	const handleMaterialRequestPermission = (value: boolean) => {
		const message = `Material request permission ${value ? "enabled" : "disabled"} successfully`;

		updateMaterialRequestPermission(
			{
				isAllowed: value,
				userId,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["employeePermissions", userId],
					});
					openSuccessToast(message);
				},
				onError: () => {
					openErrorToast({ message: "Failed to update material request permission." });
				},
			}
		);
	};

	const handleMaterialRole = (materialRole: string | null) => {
		updateMaterialRole(
			{
				materialRole,
				userId,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["employeePermissions", userId],
					});
					openSuccessToast("Material role updated successfully");
				},
				onError: () => {
					openErrorToast({ message: "Failed to update material role." });
				},
			}
		);
	};

	const handleQcPermission = (value: boolean) => {
		const message = `QC permission ${value ? "enabled" : "disabled"} successfully`;

		updateQcPermission(
			{
				isEnabled: value,
				userId,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["employeePermissions", userId],
					});
					openSuccessToast(message);
				},
				onError: () => {
					openErrorToast({
						message: "Failed to update QC permission.",
					});
				},
			}
		);
	};

	const handleAsanaPermission = (value: boolean) => {
		const message = `Asana task creation ${value ? "enabled" : "disabled"} successfully`;

		updateAsanaPermission(
			{
				isEnabled: value,
				userId,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["employeePermissions", userId],
					});
					openSuccessToast(message);
				},
				onError: () => {
					openErrorToast({
						message: "Failed to update Asana task creation.",
					});
				},
			}
		);
	};

	const handlePastDateScheduleUpdatePermission = (value: boolean) => {
		const message = `Past date schedule update ${value ? "enabled" : "disabled"} successfully`;

		updatePastDateScheduleUpdatePermission(
			{
				isAllowed: value,
				userId,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["employeePermissions", userId],
					});
					openSuccessToast(message);
				},
				onError: () => {
					openErrorToast({
						message: "Failed to update past date schedule update permission.",
					});
				},
			}
		);
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleDiscard = () => {
		setStagingConfiguration(initialConfiguration);

		queryClient.invalidateQueries({
			queryKey: ["employeePermissions", userId],
		});

		setIsEditing(false);
	};

	const handleSave = () => {
		updateUserPagesPermissions(
			{
				userId,
				updated: {
					...stagingConfiguration,
					userPagePermissions: pagePermissionsRef.current,
				},
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["employeePermissions", userId],
					});

					setIsEditing(false);

					openSuccessToast("Permissions updated successfully.");
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const handleExemptChange = (value: boolean) => {
		const message = `Exempt Time Logging at Special Job ${value ? "enabled" : "disabled"} successfully`;

		updateSpecialJobExempt(
			{
				isExempt: value,
				userId: userId,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["employeePermissions", userId],
					});
					openSuccessToast(message);
				},
				onError: () => {
					openErrorToast({ message: "Failed to update weekend self-scheduling." });
				},
			}
		);
	};

	if (isPending) return <div>Loading permissions...</div>;
	if (isError) return <div>Error loading permissions: something went wrong</div>;

	return (
		<EmployeeRolePermissionCard
			adminAllPages={adminPages || []}
			id={userId}
			handleSelfScheduling={handleSelfScheduling}
			userWithPermissions={userWithPermissions}
			handlePermissionEdit={handlePermissionEditToggle}
			handleTechnicianPermission={handleTechnicianPermission}
			isPermissionEditable={isPermissionEditable}
			currentPermission={currentPermission}
			handleWeekendSelfScheduling={handleWeekendSelfScheduling}
			handleFingerprintPermission={handleFingerprintPermission}
			handleMaterialRequestPermission={handleMaterialRequestPermission}
			handleExemptChange={handleExemptChange}
			handleMaterialRole={handleMaterialRole}
			teamName={employee?.employee?.user?.team?.name}
			userRole={roleData}
			handleQcPermission={handleQcPermission}
			handleAsanaPermission={handleAsanaPermission}
			handlePastDateScheduleUpdatePermission={handlePastDateScheduleUpdatePermission}
			isEditing={isEditing}
			pagePermissionsRef={pagePermissionsRef}
			stagingConfiguration={stagingConfiguration}
			setStagingConfiguration={setStagingConfiguration}
			trigger={
				isProductionEnv() ? (
					<EmployeeRolePermissionEditModalTrigger
						id={userId}
						permissions={userWithPermissions?.items?.permissions}
						employeeName={employee?.fullName}
						isPermissionEditable={isPermissionEditable}
					/>
				) : (
					<EditPermissions
						isEditing={isEditing}
						isSaving={isSaving}
						onEdit={handleEdit}
						onDiscard={handleDiscard}
						onSave={handleSave}
					/>
				)
			}
		/>
	);
};
