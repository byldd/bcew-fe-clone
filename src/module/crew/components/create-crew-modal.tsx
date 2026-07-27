import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/selectField";
import { Label } from "@radix-ui/react-label";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { IEmployeeNames } from "@/module/crew/types";
import { useCreateCrew, useDepartment, useEmployeesNames } from "@/module/crew/hooks/useCrew";
import { jobPhases } from "@/module/crew/constants";
import { openErrorToast } from "@/components/toast";
import { InputField } from "@/components/ui/inputField";
import { filterElectricians, filterEmployeesForDropdown } from "@/module/crew/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface CreateCrewModalProps {
	closeModal: () => void;
	handleSuccessfulCrewCreation: (name: string) => void;
}

type FormData = {
	name: string;
	crewLeaderId: string;
	departmentId: string;
	crewEmployees: IEmployeeNames[];
	jobPhaseNum: number;
};

const CreateCrewModal: React.FC<CreateCrewModalProps> = ({ closeModal, handleSuccessfulCrewCreation }) => {
	const { control, handleSubmit, setValue, watch } = useForm<FormData>({
		defaultValues: {
			name: "",
			crewLeaderId: "",
			departmentId: "",
			crewEmployees: [],
			jobPhaseNum: undefined,
		},
	});

	const dropdownRef = useRef<HTMLDivElement>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const { data: allEmployees } = useEmployeesNames();
	const { data: allDepartments } = useDepartment();

	const createCrewMutation = useCreateCrew();

	// Current selected state
	const selectedCrewLeaderId = watch("crewLeaderId");
	const selectedMembers = watch("crewEmployees");

	// Only electricians (excluding selected crew members)
	const electricians = useMemo(() => {
		if (!allEmployees) return [];
		return filterElectricians(
			allEmployees,
			selectedMembers.map((m) => m.id)
		);
	}, [allEmployees, selectedMembers]);

	// Filter employees (excluding crew leader)
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

	const handleAddMember = (emp: IEmployeeNames) => {
		if (!emp.isAlreadyInCrew) {
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
		createCrewMutation.mutate(
			{
				...data,
				crewEmployees: data.crewEmployees.map((m) => m.id),
			},
			{
				onSuccess: () => {
					handleSuccessfulCrewCreation(data.name); // open the success modal
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div>
			<form className="space-y-4 px-0.5" onSubmit={handleSubmit(onSubmit)}>
				{/* Crew Name & Crew Leader */}
				<div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2">
					{/* Crew Name */}
					<div className="mt-1 w-full">
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
								/>
							)}
						/>
					</div>

					{/* Crew Leader */}
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
										disabled: e.isAlreadyInCrew,
									}))}
									value={field.value}
									onValueChange={(val) => field.onChange(val)}
									label={tPmanagement.crewLeader}
									error={fieldState.error?.message}
								/>
							)}
						/>
					</div>
				</div>
				{/* Crew Members */}
				<Controller
					name="crewEmployees"
					control={control}
					render={() => (
						<div className="relative" ref={dropdownRef}>
							<Label className="mb-1 block text-sm text-gray-700">{tPmanagement.crewMembers}</Label>
							<Input
								placeholder={tPmanagement.searchByMember}
								className="w-full rounded-[10px] border-none bg-brand-bgLightgrey"
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setShowDropdown(true);
								}}
								onFocus={() => setShowDropdown(true)}
							/>

							{showDropdown && (
								<div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white p-1 shadow-md">
									{filteredEmployees.length === 0 ? (
										<p className="p-2 text-sm text-gray-400">{tPmanagement.noEmployeesFound}</p>
									) : (
										filteredEmployees.map((emp) => (
											<div
												key={emp.id}
												className={`cursor-pointer rounded px-2 py-1 text-sm ${
													emp.isAlreadyInCrew ? "cursor-not-allowed text-gray-400" : "hover:bg-gray-100"
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
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="mb-0.5 h-4 w-5 items-center p-0 font-normal text-white hover:bg-transparent"
											onClick={() => handleRemoveMember(member.id)}
										>
											×
										</Button>
									</span>
								))}
							</div>
						</div>
					)}
				/>

				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{/* Department */}
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
								/>
							)}
						/>
					</div>

					{/* Phase */}
					<div className="w-full">
						<Controller
							name="jobPhaseNum"
							control={control}
							rules={{ required: "Phase is required" }}
							render={({ field, fieldState }) => (
								<SelectField
									label={tPmanagement.phase}
									placeholder={tPmanagement.selectPhase}
									options={jobPhases.map((p) => ({ label: p.label, value: p.value }))}
									value={field.value}
									onValueChange={(val) => field.onChange(Number(val))}
									error={fieldState.error?.message}
								/>
							)}
						/>
					</div>
				</div>

				<div className="flex justify-between gap-2 pt-6">
					<Button
						type="button"
						onClick={closeModal}
						className="w-full"
						variant="outline"
						disabled={createCrewMutation.isPending}
					>
						{tCommon.cancel}
					</Button>
					<Button
						type="submit"
						className="w-full"
						variant="filled"
						loading={createCrewMutation.isPending}
						loadingText={tPmanagement.creating}
					>
						{tPmanagement.create}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default CreateCrewModal;
