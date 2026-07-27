"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useUpdateSubContractorCrew } from "@/module/sub-contractor/hooks/useSubContractorCrew";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { ISubContractorCrew } from "@/module/admin-sub-contractor/types";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { PhoneCountrySelect } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { crewSchema } from "@/module/sub-contractor/utils/create-update-crew-form";
import { Switch } from "@/components/ui/switch";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type UpdateCrewFormType = z.infer<typeof crewSchema>;

interface UpdateCrewFormProps {
	onClose: () => void;
	crew: ISubContractorCrew;
}

export const UpdateSubContractorCrewForm: React.FC<UpdateCrewFormProps> = ({ onClose, crew }) => {
	const { control, handleSubmit, watch, setValue } = useForm<UpdateCrewFormType>({
		resolver: zodResolver(crewSchema),
		defaultValues: {
			name: crew.name,
			crewLeaderName: crew.crewLeaderName,
			email: crew.email,
			phoneNumber: crew.phoneNumber,
			pauseAccess: crew.isAccessPaused ?? false,
			crewEmployees: crew.crewEmployees.map((emp) => emp.name),
		},
	});

	const crewEmployees = watch("crewEmployees");
	const [crewMemberInput, setCrewMemberInput] = useState("");
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	const updateCrewMutation = useUpdateSubContractorCrew(crew.id);
	const queryClient = useQueryClient();

	const handleAddMember = () => {
		if (crewMemberInput.trim()) {
			setValue("crewEmployees", [...(crewEmployees ?? []), crewMemberInput.trim()], {
				shouldValidate: true,
			});
			setCrewMemberInput("");
		}
	};

	const handleRemoveMember = (indexToRemove: number) => {
		setValue(
			"crewEmployees",
			(crewEmployees ?? []).filter((_, idx) => idx !== indexToRemove),
			{ shouldValidate: true }
		);
	};

	const onSubmit = (data: UpdateCrewFormType) => {
		updateCrewMutation.mutate(
			{
				...data,
				crewEmployees: data.crewEmployees ?? [],
				isAccessPaused: data.pauseAccess,
			},
			{
				onSuccess: (res) => {
					queryClient.invalidateQueries({ queryKey: ["subContractorCrews"] });
					openSuccessToast(
						<span>
							{tSub.crew} <span className="font-semibold">{res.name}</span>
							{tSub.crewUpdatedSuccessfully}
						</span>
					);
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="px-0.5">
			{/* Crew Name */}
			<div className="w-full space-y-3">
				<Controller
					name="name"
					control={control}
					render={({ field, fieldState }) => (
						<InputField
							{...field}
							id="name"
							label={tSub.crewName}
							placeholder={tSub.typeHere}
							error={fieldState.error?.message}
						/>
					)}
				/>

				{/* Crew Leader Name */}
				<Controller
					name="crewLeaderName"
					control={control}
					render={({ field, fieldState }) => (
						<InputField
							{...field}
							id="crewLeaderName"
							label={tSub.crewLeader}
							placeholder={tSub.typeHere}
							error={fieldState.error?.message}
						/>
					)}
				/>

				{/* Pause Access Toggle */}
				<div className="flex items-center justify-between">
					<label className="font-inter text-sm text-brand-grey">{tSub.pauseAccess}</label>

					<Controller
						name="pauseAccess"
						control={control}
						render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
					/>
				</div>

				{/* Crew Members */}
				<div className="relative w-full">
					<InputField
						id="crewMembers"
						label={tSub.addMembers}
						placeholder={tSub.typeHere}
						value={crewMemberInput}
						onChange={(e) => setCrewMemberInput(e.target.value)}
						className="border-none pr-10"
					/>
					<button
						type="button"
						onClick={handleAddMember}
						className="absolute right-3 top-11 -translate-y-1/2 text-gray-600 hover:text-black"
					>
						<Plus size={18} />
					</button>
				</div>

				<div className="mt-3 flex flex-wrap gap-2">
					{(crewEmployees ?? []).map((member, index) => (
						<Badge key={`${member}-${index}`}>
							{member}
							<X className="ml-2 h-4 w-4 cursor-pointer" onClick={() => handleRemoveMember(index)} />
						</Badge>
					))}
				</div>

				{/* Email */}
				<Controller
					name="email"
					control={control}
					render={({ field, fieldState }) => (
						<InputField
							{...field}
							id="email"
							label={tSub.crewLeaderEmail}
							placeholder={tSub.typeHere}
							type="email"
							error={fieldState.error?.message}
						/>
					)}
				/>

				<Controller
					name="phoneNumber"
					control={control}
					render={({ field, fieldState }) => (
						<div className="space-y-2">
							<label className="block font-inter text-sm font-normal text-brand-grey md:text-sm">
								{tSub.crewLeaderPhone}
							</label>
							<PhoneInput
								{...field}
								defaultCountry="US"
								international
								countryCallingCodeEditable={false}
								countrySelectComponent={PhoneCountrySelect}
								className="flex h-10 w-full items-center gap-2 rounded-[8px] border p-2 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:outline-none"
								placeholder={tSub.enterPhoneNumber}
							/>
							{fieldState.error && <p className="mt-1 text-xs text-red-500">{fieldState.error.message}</p>}
						</div>
					)}
				/>

				{/* Action Buttons */}
				<div className="flex flex-col gap-2 py-4">
					<Button
						disabled={updateCrewMutation.isPending}
						className="w-full"
						variant="outline"
						onClick={onClose}
						type="button"
					>
						{tSub.cancel}
					</Button>

					<Button
						variant="filled"
						type="submit"
						loading={updateCrewMutation.isPending}
						loadingText="Updating..."
						className="w-full"
					>
						{tSub.updateCrew}
					</Button>
				</div>
			</div>
		</form>
	);
};
