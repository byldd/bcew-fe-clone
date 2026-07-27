import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/selectField";
import { Label } from "@radix-ui/react-label";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ICrewWithDetails, IEmployeeNames } from "@/module/crew/types";
import { useDepartment, useEmployeesNames, useUpdateCrew } from "@/module/crew/hooks/useCrew";
import { jobPhases } from "@/module/crew/constants";
import { InputField } from "@/components/ui/inputField";
import { filterElectricians, filterEmployeesForDropdown, mapCrewEmployeesToForm } from "@/module/crew/utils";
import { openErrorToast } from "@/components/toast";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { RxCross2 } from "react-icons/rx";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface EditCrewModalProps {
	onClose: () => void;
	crew: ICrewWithDetails;
	handleSuccessfulCrewUpdate: () => void;
	accessLevel: ACCESS_LEVEL | undefined;
}

type FormData = {
	name: string;
	crewLeaderId: string;
	departmentId: string;
	crewEmployees: IEmployeeNames[];
	jobPhaseNum: number;
};

export const EditCrewModal: React.FC<EditCrewModalProps> = ({
	crew,
	onClose,
	handleSuccessfulCrewUpdate,
	accessLevel,
}) => {
	const { control, handleSubmit, setValue, watch } = useForm<FormData>({
		defaultValues: {
			name: crew.name,
			crewLeaderId: crew.crewLeaderId,
			departmentId: crew.departmentId,
			crewEmployees: mapCrewEmployeesToForm(crew),
			jobPhaseNum: crew.jobPhaseNum,
		},
	});

	const dropdownRef = useRef<HTMLDivElement>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);

	const { data: allEmployees } = useEmployeesNames();
	const { data: allDepartments } = useDepartment();
	const updateCrewMutation = useUpdateCrew(crew.id);
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const selectedCrewLeaderId = watch("crewLeaderId");
	const selectedMembers = watch("crewEmployees");

	const electricians = useMemo(() => {
		if (!allEmployees) return [];
		return filterElectricians(
			allEmployees,
			selectedMembers.map((m) => m.id)
		);
	}, [allEmployees, selectedMembers]);

	const filteredEmployees = useMemo(() => {
		if (!allEmployees) return [];
		return filterEmployeesForDropdown(allEmployees, searchTerm, selectedCrewLeaderId);
	}, [allEmployees, selectedCrewLeaderId, searchTerm]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const isEmployeeDisabled = (emp: IEmployeeNames) => {
		// Allow employees already in this crew or leader
		const isInCurrentCrew = crew.crewEmployees.some((e) => e.employee.id === emp.id) || crew.crewLeaderId === emp.id;

		return emp.isAlreadyInCrew && !isInCurrentCrew;
	};

	const handleAddMember = (emp: IEmployeeNames) => {
		if (!isEmployeeDisabled(emp)) {
			const alreadyExists = selectedMembers.some((m) => m.id === emp.id);
			if (!alreadyExists) {
				setValue("crewEmployees", [...selectedMembers, emp], { shouldValidate: true });
			}
			setSearchTerm("");
			setShowDropdown(false);
		}
	};

	const handleRemoveMember = (id: string) => {
		const updated = selectedMembers.filter((m) => m.id !== id);
		setValue("crewEmployees", updated, { shouldValidate: true });
	};

	const onSubmit = (data: FormData) => {
		updateCrewMutation.mutate(
			{
				...data,
				crewEmployees: data.crewEmployees.map((m) => m.id),
			},
			{
				onSuccess: () => {
					handleSuccessfulCrewUpdate();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const isEditable = accessLevel === ACCESS_LEVEL.WRITE;

	return (
		<div className="p-1">
			<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
				{/* Name & Leader */}
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="w-full">
						<Controller
							name="name"
							control={control}
							rules={{ required: "Crew name is required" }}
							render={({ field, fieldState }) => (
								<InputField
									id="name"
									label={tPmanagement.crewName}
									name={field.name}
									value={field.value}
									onChange={field.onChange}
									placeholder={tPmanagement.crewNameHere}
									error={fieldState.error?.message}
									disabled={!isEditable}
								/>
							)}
						/>
					</div>
					<div className="w-full">
						<Controller
							name="crewLeaderId"
							control={control}
							rules={{ required: "Crew leader is required" }}
							render={({ field, fieldState }) => (
								<SelectField
									placeholder={tPmanagement.selectCrewLeader}
									options={electricians.map((e) => ({
										label: e.EmployeeName,
										value: e.id,
										disabled: isEmployeeDisabled(e),
									}))}
									value={field.value}
									onValueChange={field.onChange}
									label={tPmanagement.crewLeader}
									error={fieldState.error?.message}
									disabled={!isEditable}
								/>
							)}
						/>
					</div>
				</div>

				{/* Members */}
				<Controller
					name="crewEmployees"
					control={control}
					render={() => (
						<div className="relative" ref={dropdownRef}>
							<Label className="mb-1 block text-sm text-gray-700">{tPmanagement.crewMembers}</Label>
							{isEditable && (
								<Input
									placeholder={tPmanagement.searchByMember}
									className="w-full rounded-[10px] border-none bg-brand-bgLightgrey"
									value={searchTerm}
									onChange={(e) => {
										setSearchTerm(e.target.value);
										setShowDropdown(true);
									}}
									onFocus={() => setShowDropdown(true)}
									disabled={!isEditable}
								/>
							)}

							{showDropdown && (
								<div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white p-1 shadow-md">
									{filteredEmployees.length === 0 ? (
										<p className="p-2 text-sm text-gray-400">{tPmanagement.noEmployeesFound}</p>
									) : (
										filteredEmployees.map((emp) => (
											<div
												key={emp.id}
												className={`cursor-pointer rounded px-2 py-1 text-sm ${
													isEmployeeDisabled(emp) ? "cursor-not-allowed text-gray-400" : "hover:bg-gray-100"
												}`}
												onClick={() => handleAddMember(emp)}
											>
												{emp.EmployeeName}
											</div>
										))
									)}
								</div>
							)}

							{/* Selected Members */}
							<div className="mt-2 flex flex-wrap gap-2">
								{selectedMembers.map((member) => (
									<span
										key={member.id}
										className="flex items-center gap-1 rounded-[10px] bg-brand-dark px-3 py-2 text-xs text-white"
									>
										{member.EmployeeName}
										{isEditable && (
											<Button
												type="button"
												variant="ghost"
												className="mb-0.5 ml-1 h-4 w-4 p-0 font-normal text-white hover:bg-transparent"
												onClick={() => handleRemoveMember(member.id)}
												disabled={!isEditable}
											>
												<RxCross2 />
											</Button>
										)}
									</span>
								))}
							</div>
						</div>
					)}
				/>

				{/* Department & Phase */}
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="w-full">
						<Controller
							name="departmentId"
							control={control}
							rules={{ required: "Department is required" }}
							render={({ field, fieldState }) => (
								<SelectField
									label={tPmanagement.department}
									placeholder={tPmanagement.selectDepartment}
									options={
										allDepartments?.map((dept) => ({
											label: dept.dptnme,
											value: dept.idnum,
										})) || []
									}
									value={field.value}
									onValueChange={field.onChange}
									error={fieldState.error?.message}
									disabled={!isEditable}
								/>
							)}
						/>
					</div>

					<div className="w-full">
						<Controller
							name="jobPhaseNum"
							control={control}
							rules={{ required: "Phase is required" }}
							render={({ field, fieldState }) => (
								<SelectField
									label={tPmanagement.phase}
									placeholder="e.g. Rough, Final..."
									options={jobPhases.map((p) => ({ label: p.label, value: p.value }))}
									value={field.value}
									onValueChange={(val) => field.onChange(Number(val))}
									error={fieldState.error?.message}
									disabled={!isEditable}
								/>
							)}
						/>
					</div>
				</div>

				{isEditable && (
					<div className="mt-6 flex justify-between gap-2">
						<Button
							type="button"
							onClick={onClose}
							className="w-full"
							variant="outline"
							disabled={updateCrewMutation.isPending}
						>
							{tCommon.cancel}
						</Button>

						<Button
							type="submit"
							className="w-full"
							variant="filled"
							loading={updateCrewMutation.isPending}
							loadingText="Updating..."
						>
							{tCommon.update}
						</Button>
					</div>
				)}
			</form>
		</div>
	);
};
