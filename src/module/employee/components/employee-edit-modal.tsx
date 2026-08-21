"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { IEmployeeDetailsResponse } from "@/module/employee/types";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import { SelectField } from "@/components/ui/selectField";
import { getMonthsSinceDate, getYearsSinceDate, toFormattedDate } from "@/lib/utils/date";
import { useRoles } from "@/module/employee/hooks/useRolesAndPermissions";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTeams } from "@/module/team/hooks/useTeams";
import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import { useUpdateUserConfiguration } from "@/module/employee/hooks/useEmployee";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModal";
import ConfirmBeforeNavigationModal from "@/module/employee/components/confirm-before-navigation-modal";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { MultiSelect } from "@/components/ui/multi-select";
import { EMPLOYEE_PHASES } from "../constants";
import { formatSnakeCase } from "@/lib/utils/value-formatter";

interface Props {
	onClose: () => void;
	employee: IEmployeeDetailsResponse;
}

type FormData = {
	jobRoleId: string;
	teamId: string;
	workingHoursType: TimeSource | "";
	expectedOutput: string;
	phases: string[];
};

const EmployeeEditModal: React.FC<Props> = ({ onClose, employee }) => {
	const { data: roles, isPending, isError } = useRoles();
	const { data: teams } = useTeams();
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const queryClient = useQueryClient();
	const router = useRouter();

	const { openModal, closeModal, Modal } = useModal();

	// Store initial values
	const initialFormData: FormData = {
		jobRoleId: employee?.employee?.user?.roleId || "",
		teamId: employee?.employee?.user?.teamId || "",
		workingHoursType: employee?.employee?.user?.timeSource || "",
		expectedOutput: "",
		phases: employee?.employee?.user?.phases ? JSON.parse(employee?.employee?.user?.phases) : [],
	};

	const phaseOptions = Object.keys(EMPLOYEE_PHASES)?.map((key) => ({
		id: EMPLOYEE_PHASES[key as unknown as number] || "",
		name: formatSnakeCase(EMPLOYEE_PHASES[key as unknown as number]) || "",
	}));

	const { control, handleSubmit, watch } = useForm<FormData>({
		defaultValues: initialFormData,
		mode: "onChange",
	});

	const currentValues = watch();

	const updateConfig = useUpdateUserConfiguration(employee.employee?.userId);

	// helper for redirect logic
	const handleCustomRedirect = () => {
		const hasChanged =
			currentValues.jobRoleId !== initialFormData.jobRoleId ||
			currentValues.teamId !== initialFormData.teamId ||
			currentValues.workingHoursType !== initialFormData.workingHoursType ||
			currentValues.expectedOutput !== initialFormData.expectedOutput;

		if (hasChanged) {
			openModal({
				modalTitle: tPeople.unsavedChangesWarning,
				modalView: (
					<ConfirmBeforeNavigationModal
						onCancel={() => {
							router.push(`${routes?.admin?.roster}?userId=${employee?.employee?.userId}`);
							closeModal();
						}}
						onConfirm={() => {
							handleSubmit((data) => {
								updateConfig.mutate(
									{
										roleId: data.jobRoleId,
										teamId: data.teamId,
										timeSource: data.workingHoursType,
									},
									{
										onSuccess: () => {
											closeModal();
											router.push(`${routes?.admin?.roster}?userId=${employee?.employee?.userId}`);
										},
										onError: (error) => {
											openErrorToast({ error });
											closeModal();
										},
									}
								);
							})();
						}}
						isSubmitting={updateConfig.isPending}
					/>
				),
			});
		} else {
			router.push(`${routes?.admin?.roster}?userId=${employee?.employee?.userId}`);
		}
	};

	const onSubmit = (data: FormData) => {
		updateConfig.mutate(
			{
				roleId: data.jobRoleId,
				teamId: data.teamId,
				timeSource: data.workingHoursType,
				phases: data.phases,
			},
			{
				onSuccess: (res) => {
					queryClient.invalidateQueries({ queryKey: ["employee"] });
					queryClient.invalidateQueries({ queryKey: ["employeeWeeklyRoster"] });
					queryClient.invalidateQueries({ queryKey: ["employeePermissions"] });
					openSuccessToast(res?.message || "Configuration updated successfully.");
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	if (isPending) return <div>Loading...</div>;
	if (isError || !roles) return <div>Failed to load roles</div>;

	return (
		<div>
			<Modal />
			<form onSubmit={handleSubmit(onSubmit)} className="p-0 pb-2">
				<div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<InputField label={tPeople.fullName} value={employee.fullName} disabled />
					<InputField label={tPeople.phone} value={employee.phone} disabled />

					<InputField label={tPeople.emailId} value={employee.emailID} disabled />
					<InputField label={tPeople.crewName} value={employee.crew?.name || "-"} disabled />

					<InputField label={tPeople.crewLeader} value={employee?.crew?.crewLeader?.employeeName || "-"} disabled />
					<InputField label={tPeople.department} value={employee.department} disabled />

					{/* Editable Job Role */}
					<Controller
						name="jobRoleId"
						control={control}
						render={({ field }) => (
							<SelectField
								label={tPeople.jobRole}
								placeholder={tPeople.selectJobRole}
								options={roles.map((role) => ({
									label: role.name,
									value: role.id,
								}))}
								value={field.value}
								onValueChange={field.onChange}
							/>
						)}
					/>

					<InputField
						label={tPeople.hireDate}
						value={employee.joiningDate ? toFormattedDate(employee.joiningDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-"}
						disabled
					/>

					{/* Editable Team */}
					<Controller
						name="teamId"
						control={control}
						render={({ field }) => (
							<SelectField
								label={tPeople.team}
								placeholder={tPeople.selectTeam}
								options={(teams ?? []).map((team) => ({
									label: team.name,
									value: team.id,
								}))}
								value={field.value}
								onValueChange={field.onChange}
							/>
						)}
					/>

					<InputField
						label={tPeople.numberOfMonths}
						value={getMonthsSinceDate(employee.joiningDate)?.toString() || "-"}
						disabled
					/>
					<InputField
						label={tPeople.numberOfYears}
						value={getYearsSinceDate(employee.joiningDate)?.toString() || "-"}
						disabled
					/>

					{/* Editable Expected Output */}
					<Controller
						name="expectedOutput"
						control={control}
						render={({ field }) => (
							<InputField
								label={tPeople.expectedOutput}
								type="number"
								step="0.1"
								min="0"
								disabled // TODO: Currently disabled
								value={field.value}
								onChange={(e) => field.onChange(e.target.value)}
							/>
						)}
					/>

					<Controller
						name="phases"
						control={control}
						render={({ field }) => (
							<MultiSelect
								label="Phases"
								options={phaseOptions}
								selected={field.value.map((phase) => ({
									id: phase,
									name: formatSnakeCase(phase),
								}))}
								onChange={(selected) => {
									field.onChange(selected.map((phase) => phase.id));
								}}
							/>
						)}
					/>
				</div>

				<div className="mt-6">
					<h3 className="mb-2 text-xl font-semibold text-brand-dark">{tPeople.standardWorkingHours}</h3>
					<Controller
						name="workingHoursType"
						control={control}
						render={({ field }) => (
							<>
								<SelectField
									placeholder={tPeople.selectWorkingHours}
									options={[
										{ label: "Team Standard Hours", value: TimeSource.TEAM },
										{ label: "Role Standard Hours", value: TimeSource.ROLE },
										{ label: "Customized Working Hours", value: TimeSource.CUSTOM },
									]}
									value={field.value}
									onValueChange={field.onChange}
								/>

								{field.value === TimeSource.CUSTOM && (
									<p className="mt-2 text-sm text-gray-500">
										{tPeople.customizeWorkingHoursIn}{" "}
										<Button
											type="button"
											onClick={handleCustomRedirect}
											className="cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-gray-600 underline"
										>
											{tPeople.employeesTimeConfigurationScreen}
										</Button>
									</p>
								)}
							</>
						)}
					/>
				</div>

				<div className="mt-6 flex justify-end gap-2">
					<Button
						disabled={updateConfig.isPending}
						onClick={onClose}
						variant="outline"
						className="w-full"
						type="button"
					>
						{tCommon.cancel}
					</Button>

					<Button variant="filled" type="submit" loading={updateConfig.isPending} className="w-full">
						{tCommon.save}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default EmployeeEditModal;
