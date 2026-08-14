import React from "react";
import { TextareaField } from "@/components/ui/textareaField";
import { useFormContext } from "react-hook-form";
import { IUpdateDailyJobFormSchema } from "../utils/create-daily-job-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import RadioGroupField from "@/components/ui/radio-group-field";
import { Label } from "@/components/ui/label";
import { OptionYesNo } from "@/utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { isBoolean } from "@/module/job/utils";

const NotReadyFields = () => {
	const formContext = useFormContext<IUpdateDailyJobFormSchema>();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	const { notReadyUpdate } = formContext.watch();
	const { noteFromCrewMember } = notReadyUpdate || {};

	return (
		<div className="space-y-4">
			<div className="space-y-3">
				<p className="text-base font-medium text-brand-dark">{tjobCards.title}</p>

				<div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
					<FormField
						control={formContext.control}
						name="notReadyUpdate.isReady"
						render={({ field }) => (
							<FormItem className="w-full flex-1">
								<Label className="text-sm font-medium text-brand-dark60">{tschedule.isTheSiteReady}</Label>
								<FormControl>
									<RadioGroupField
										options={Object.values(OptionYesNo).map((option) => ({
											label: option,
											value: option,
										}))}
										value={!isBoolean(field.value) ? undefined : field.value ? OptionYesNo.YES : OptionYesNo.NO}
										onChange={(value) => field.onChange(value === OptionYesNo.YES)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={formContext.control}
						name="notReadyUpdate.isClean"
						render={({ field }) => (
							<FormItem className="w-full flex-1">
								<Label className="text-sm font-medium text-brand-dark60">{tschedule.isTheHomeClean}</Label>
								<FormControl>
									<RadioGroupField
										options={Object.values(OptionYesNo).map((option) => ({
											label: option,
											value: option,
										}))}
										value={!isBoolean(field.value) ? undefined : field.value ? OptionYesNo.YES : OptionYesNo.NO}
										onChange={(value) => field.onChange(value === OptionYesNo.YES)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</div>
			<div className="space-y-1">
				<p className="text-sm font-medium text-brand-dark60">{tschedule.noteFromCrewMember}</p>
				<p className="text-sm text-brand-dark">{noteFromCrewMember || "-"}</p>
			</div>
			<FormField
				control={formContext.control}
				name="notReadyUpdate.updateForCrew"
				render={({ field }) => (
					<FormItem className="w-full flex-1">
						<FormControl>
							<TextareaField
								label={tschedule.updateForTheCrewMembers}
								placeholder={tschedule.updateTheCrewWithAnyRelevantInformationHere}
								value={field.value || ""}
								onChange={(e) => field.onChange(e.target.value)}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			{/* <div>
				<TextareaField
					placeholder={tschedule.noteFromCrewMember}
					disabled
					label={tschedule.noteFromCrewMember}
					value={noteFromCrewMember || ""}
				/>
			</div> */}
		</div>
	);
};

export default NotReadyFields;
