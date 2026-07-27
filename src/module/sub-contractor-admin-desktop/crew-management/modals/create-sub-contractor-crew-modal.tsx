"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { PhoneCountrySelect } from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { crewSchema } from "@/module/sub-contractor/utils/create-update-crew-form";
import { useCreateSubContractorCrew } from "@/module/sub-contractor/hooks/useSubContractorCrew";
import { openErrorToast } from "@/components/toast";
import { CreateSubContractorCrewModalProps } from "../types/crew";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type CreateCrewFormType = z.infer<typeof crewSchema>;

const CreateSubContractorCrewModal: React.FC<CreateSubContractorCrewModalProps> = ({
	closeModal,
	handleSuccessfulCrewCreation,
}) => {
	const { control, handleSubmit, watch, setValue } = useForm<CreateCrewFormType>({
		resolver: zodResolver(crewSchema),
		defaultValues: {
			name: "",
			crewLeaderName: "",
			email: "",
			phoneNumber: "",
			pauseAccess: false,
			crewEmployees: [],
		},
	});

	const crewEmployees = watch("crewEmployees");
	const [crewMemberInput, setCrewMemberInput] = useState("");
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	const createCrewMutation = useCreateSubContractorCrew();

	/* ──────────────────────────────
	 * Crew Members handlers
	 * ────────────────────────────── */
	const handleAddMember = () => {
		if (!crewMemberInput.trim()) return;

		setValue("crewEmployees", [...(crewEmployees ?? []), crewMemberInput.trim()], {
			shouldValidate: true,
		});
		setCrewMemberInput("");
	};

	const handleRemoveMember = (index: number) => {
		setValue(
			"crewEmployees",
			(crewEmployees ?? []).filter((_, i) => i !== index),
			{ shouldValidate: true }
		);
	};

	/* ──────────────────────────────
	 * Submit
	 * ────────────────────────────── */
	const onSubmit = (data: CreateCrewFormType) => {
		createCrewMutation.mutate(
			{
				...data,
				crewEmployees: data.crewEmployees ?? [],
				isAccessPaused: data.pauseAccess,
			},
			{
				onSuccess: (res) => {
					handleSuccessfulCrewCreation(res?.name ?? "Crew");
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-0.5">
			{/* ───────────────── Top Section (2 columns) ───────────────── */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
				<Controller
					name="name"
					control={control}
					render={({ field, fieldState }) => (
						<InputField
							{...field}
							label={tSub.crewName}
							placeholder={tSub.typeHere}
							error={fieldState.error?.message}
						/>
					)}
				/>

				<Controller
					name="crewLeaderName"
					control={control}
					render={({ field, fieldState }) => (
						<InputField
							{...field}
							label={tSub.crewLeader}
							placeholder={tSub.typeHere}
							error={fieldState.error?.message}
						/>
					)}
				/>
			</div>

			{/* ───────────────── Add Members ───────────────── */}
			<div className="relative">
				<InputField
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

			{(crewEmployees ?? []).length > 0 && (
				<div className="flex flex-wrap gap-2">
					{crewEmployees?.map((member, index) => (
						<Badge key={`${member}-${index}`} className="gap-1">
							{member}
							<X className="h-4 w-4 cursor-pointer" onClick={() => handleRemoveMember(index)} />
						</Badge>
					))}
				</div>
			)}

			{/* ───────────────── Email ───────────────── */}
			<Controller
				name="email"
				control={control}
				render={({ field, fieldState }) => (
					<InputField
						{...field}
						label={tSub.crewLeaderEmail}
						placeholder={tSub.emailHere}
						type="email"
						error={fieldState.error?.message}
					/>
				)}
			/>

			{/* ───────────────── Phone ───────────────── */}
			<Controller
				name="phoneNumber"
				control={control}
				render={({ field, fieldState }) => (
					<div className="space-y-1">
						<label className="text-sm text-brand-grey">{tSub.crewLeaderPhone}</label>
						<PhoneInput
							{...field}
							defaultCountry="US"
							international
							countryCallingCodeEditable={false}
							countrySelectComponent={PhoneCountrySelect}
							className="flex h-10 w-full items-center gap-2 rounded-[8px] border p-2 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:outline-none"
							placeholder={tSub.enterPhoneNumber}
						/>
						{fieldState.error && <p className="text-xs text-red-500">{fieldState.error.message}</p>}
					</div>
				)}
			/>

			{/* ───────────────── Pause Access ───────────────── */}
			<div className="flex items-center justify-between">
				<span className="text-sm text-brand-grey">{tSub.pauseAccess}</span>
				<Controller
					name="pauseAccess"
					control={control}
					render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
				/>
			</div>

			{/* ───────────────── Footer Actions ───────────────── */}
			<div className="flex w-full justify-between gap-3 pt-4">
				<Button variant="outline" type="button" onClick={closeModal} className="w-full">
					{tSub.cancel}
				</Button>
				<Button
					variant="filled"
					type="submit"
					loading={createCrewMutation.isPending}
					className="w-full"
					loadingText="Creating..."
				>
					{tSub.createCrew}
				</Button>
			</div>
		</form>
	);
};

export default CreateSubContractorCrewModal;
